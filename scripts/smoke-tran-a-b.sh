#!/usr/bin/env bash
# Smoke test Tranșa A + B — hits running server at PORT (default 3456)
set -u
PORT="${PORT:-3456}"
BASE="http://localhost:${PORT}"
COOKIES="/tmp/agro-smoke-cookies.txt"
rm -f "$COOKIES"

pass=0
fail=0

ok() { echo "  OK   — $*"; pass=$((pass+1)); }
ko() { echo "  FAIL — $*"; fail=$((fail+1)); }

req() {
  local method="$1" path="$2" body="${3:-}"
  local args=(-s -b "$COOKIES" -c "$COOKIES" -w "\n__HTTP__%{http_code}" -X "$method" -H "Content-Type: application/json")
  if [ -n "$body" ]; then
    args+=(-d "$body")
  fi
  curl "${args[@]}" "$BASE$path"
}

status() { echo "$1" | grep -oE '__HTTP__[0-9]+' | tail -1 | sed 's/__HTTP__//'; }
body() { echo "$1" | sed '/__HTTP__/d'; }
getfield() { node -e "try{const o=JSON.parse(process.argv[1]);console.log(o$2 ?? '')}catch(e){console.log('')}" "$1" "$2"; }

echo "== A#5 login admin + requirePasswordChange =="
r=$(req POST /api/auth/login '{"username":"admin","password":"Agro2026!"}')
[ "$(status "$r")" = "200" ] && ok "login 200" || ko "login status=$(status "$r") body=$(body "$r")"
rpc=$(getfield "$(body "$r")" ".user.requirePasswordChange")
[ "$rpc" = "true" ] && ok "requirePasswordChange=true la login seed" || ko "requirePasswordChange=$rpc (asteptat true)"

echo "== A#3 change-password blacklist Agro2026! =="
r=$(req POST /api/auth/change-password '{"currentPassword":"Agro2026!","newPassword":"Agro2026!","confirmPassword":"Agro2026!"}')
[ "$(status "$r")" = "400" ] && ok "blacklist respinsa 400" || ko "status=$(status "$r")"

echo "== A#3 change-password cu politica OK =="
r=$(req POST /api/auth/change-password '{"currentPassword":"Agro2026!","newPassword":"Noua2026Parola","confirmPassword":"Noua2026Parola"}')
[ "$(status "$r")" = "200" ] && ok "change-password OK" || ko "status=$(status "$r") body=$(body "$r")"

echo "== A#5 dupa change-password, requirePasswordChange=false =="
r=$(req GET /api/auth/me)
rpc=$(getfield "$(body "$r")" ".user.requirePasswordChange")
[ "$rpc" = "false" ] && ok "flag clear dupa change-password" || ko "requirePasswordChange=$rpc"

echo "== A#2 config-create cu changeReason emite audit =="
r=$(req POST /api/config/partners '{"name":"Partener Smoke","idno":"999111","address":"Chisinau","phone":"+37370000000","role":"furnizor","fiscalProfile":"Persoana fizica","changeReason":"smoke test"}')
[ "$(status "$r")" = "201" ] && ok "config-create 201" || ko "status=$(status "$r") body=$(body "$r")"

echo "== A#2 config-create fara changeReason = 400 =="
r=$(req POST /api/config/partners '{"name":"Fara Reason","role":"furnizor","fiscalProfile":"Persoana fizica"}')
[ "$(status "$r")" = "400" ] && ok "respins fara changeReason" || ko "status=$(status "$r")"

echo "== A#6 audit ascunde passwordHash =="
# create a test user via config
r=$(req POST /api/config/users '{"name":"Smoke Tester","username":"smoke.tester","roleCode":"operator","channel":"web","active":true,"password":"TestParola2026","changeReason":"creare user smoke"}')
[ "$(status "$r")" = "201" ] && ok "user creat" || ko "user create status=$(status "$r") body=$(body "$r")"

r=$(req GET /api/audit-logs)
if echo "$(body "$r")" | grep -q '"passwordHash":"\*\*\*"'; then
  ok "passwordHash mascat in audit"
else
  # accept absenta campului ca alternativa — important e sa nu fie hash real
  if echo "$(body "$r")" | grep -qE '"passwordHash":"[a-f0-9]{32,}"'; then
    ko "passwordHash NU e mascat (hash real expus)"
  else
    ok "passwordHash absent sau mascat in audit"
  fi
fi

echo "== Seed recepție pentru Q1 =="
r=$(req POST /api/receipts '{"supplierId":1,"productId":1,"quantity":100,"grossQuantity":100,"price":3000,"humidity":14,"impurity":2,"finalNetQuantity":100,"provisionalNetQuantity":100,"preliminaryPayableAmount":300000}')
[ "$(status "$r")" = "201" ] && ok "receipt creat" || ko "receipt status=$(status "$r") body=$(body "$r")"
RECEIPT_ID=$(getfield "$(body "$r")" ".id")
echo "  RECEIPT_ID=$RECEIPT_ID"

echo "== Q1 create delivery in Proiect =="
r=$(req POST /api/deliveries "{\"receiptId\":$RECEIPT_ID,\"customerId\":2,\"plannedQuantity\":30,\"contractPrice\":3200}")
[ "$(status "$r")" = "201" ] && ok "delivery creat 201" || ko "status=$(status "$r") body=$(body "$r")"
DEL_ID=$(getfield "$(body "$r")" ".id")
DEL_STATUS=$(getfield "$(body "$r")" ".status")
echo "  DEL_ID=$DEL_ID status=$DEL_STATUS"
[ "$DEL_STATUS" = "Proiect" ] && ok "status=Proiect la create" || ko "status la create=$DEL_STATUS"

echo "== Q1 confirm delivery → Rezervat =="
r=$(req POST "/api/deliveries/$DEL_ID/confirm" '{"changeReason":"confirmare smoke"}')
[ "$(status "$r")" = "200" ] && ok "confirm 200" || ko "confirm status=$(status "$r") body=$(body "$r")"
NEW_STATUS=$(getfield "$(body "$r")" ".status")
[ "$NEW_STATUS" = "Confirmat" ] && ok "status=Confirmat" || ko "status dupa confirm=$NEW_STATUS"

r=$(req GET /api/receipts)
RESERVED=$(node -e "const o=JSON.parse(process.argv[1]);const r=o.receipts.find(x=>x.id==$RECEIPT_ID);console.log(r?.reservedQuantity ?? '')" "$(body "$r")")
[ "$RESERVED" = "30" ] && ok "receipt.reservedQuantity=30" || ko "reservedQuantity=$RESERVED"

echo "== Q1 deliver fara greutati → 400 =="
r=$(req POST "/api/deliveries/$DEL_ID/deliver" '{"changeReason":"fara cantar"}')
[ "$(status "$r")" = "400" ] && ok "deliver fara greutati respins" || ko "status=$(status "$r") body=$(body "$r")"

echo "== Q1 deliver cu greutati → Livrat cu netWeight =="
r=$(req POST "/api/deliveries/$DEL_ID/deliver" '{"grossWeight":30000,"tareWeight":3000,"changeReason":"cantarit"}')
[ "$(status "$r")" = "200" ] && ok "deliver 200" || ko "deliver status=$(status "$r") body=$(body "$r")"
NW=$(getfield "$(body "$r")" ".netWeight")
[ "$NW" = "27000" ] && ok "netWeight=27000" || ko "netWeight=$NW"

echo "== Q2 complaint pe delivery =="
r=$(req POST /api/complaints "{\"deliveryId\":$DEL_ID,\"complaintType\":\"Calitate\",\"contestedQuantity\":500}")
[ "$(status "$r")" = "201" ] && ok "complaint 201" || ko "complaint status=$(status "$r") body=$(body "$r")"
COMP_ID=$(getfield "$(body "$r")" ".id")

echo "== Q2 close receipt → 400 (reclamație deschisă) =="
r=$(req POST "/api/receipts/$RECEIPT_ID/close" '{"changeReason":"inchidere smoke"}')
[ "$(status "$r")" = "400" ] && ok "close blocat de reclamatie" || ko "close status=$(status "$r") body=$(body "$r")"

echo "== Q4 PATCH complaint cu stockCorrection ca admin (accept intern) =="
# admin trece prin gating intern (admin in whitelist)
r=$(req PATCH "/api/complaints/$COMP_ID" "{\"status\":\"Acceptata\",\"stockCorrection\":{\"deliveryId\":$DEL_ID,\"deltaQuantity\":-100,\"note\":\"corectie smoke\"},\"changeReason\":\"acceptare reclamatie\"}")
[ "$(status "$r")" = "200" ] && ok "complaint acceptata cu stockCorrection" || ko "status=$(status "$r") body=$(body "$r")"

echo "== Q2 close receipt dupa acceptare → 200 =="
# trebuie receipt status Procesata sau Confirmat ca sa poata close. Acum e Draft inca.
# Fortam: face PATCH status Procesata manual
r=$(req PATCH "/api/receipts/$RECEIPT_ID/status" '{"status":"Procesata","changeReason":"forteaza procesata"}')
[ "$(status "$r")" = "200" ] && ok "status=Procesata forced" || ko "status set fail: $(body "$r")"

r=$(req POST "/api/receipts/$RECEIPT_ID/close" '{"changeReason":"inchidere dupa rezolvare"}')
[ "$(status "$r")" = "200" ] && ok "close 200" || ko "close status=$(status "$r") body=$(body "$r")"

echo "== Q2 reopen receipt =="
r=$(req POST "/api/receipts/$RECEIPT_ID/reopen" '{"changeReason":"redeschidere smoke"}')
[ "$(status "$r")" = "200" ] && ok "reopen 200" || ko "status=$(status "$r")"

echo "== Q3 recepție nouă + supra-plată → advance =="
r=$(req POST /api/receipts '{"supplierId":1,"productId":1,"quantity":10,"grossQuantity":10,"price":1000,"humidity":14,"impurity":2,"finalNetQuantity":10,"provisionalNetQuantity":10}')
[ "$(status "$r")" = "201" ] && ok "receipt2 creat" || ko "receipt2: $(body "$r")"
R2=$(getfield "$(body "$r")" ".id")
OUTSTANDING=$(getfield "$(body "$r")" ".preliminaryPayableAmount")
echo "  outstanding calculat = $OUTSTANDING"

# trimite 20% peste outstanding ca supra-platA
PAY=$(node -e "console.log(Math.ceil($OUTSTANDING * 1.2))")
EXPECTED_ADVANCE=$(node -e "console.log($PAY - $OUTSTANDING)")

r=$(req POST /api/transactions "{\"referenceType\":\"receipt\",\"receiptId\":$R2,\"amount\":$PAY,\"direction\":\"payment\",\"paymentType\":\"Numerar\"}")
[ "$(status "$r")" = "201" ] && ok "transaction 201" || ko "tx status=$(status "$r") body=$(body "$r")"
ADV=$(getfield "$(body "$r")" ".advanceAmount")
APP=$(getfield "$(body "$r")" ".appliedAmount")
[ "$ADV" = "$EXPECTED_ADVANCE" ] && ok "advanceAmount=$ADV (asteptat $EXPECTED_ADVANCE)" || ko "advanceAmount=$ADV (asteptat $EXPECTED_ADVANCE)"
[ "$APP" = "$OUTSTANDING" ] && ok "appliedAmount=$APP = outstanding" || ko "appliedAmount=$APP (asteptat $OUTSTANDING)"

echo "== Q3 partner-advances listate =="
r=$(req GET /api/partner-advances)
REMAIN=$(node -e "const o=JSON.parse(process.argv[1]);console.log((o.partnerAdvances||[])[0]?.remainingAmount ?? '')" "$(body "$r")")
[ "$REMAIN" = "$EXPECTED_ADVANCE" ] && ok "remainingAmount=$REMAIN in partnerAdvances" || ko "remainingAmount=$REMAIN"

echo "== Q3 recepție 3 + apply-advance (jumatate din avans) =="
r=$(req POST /api/receipts '{"supplierId":1,"productId":1,"quantity":5,"grossQuantity":5,"price":500,"humidity":14,"impurity":2,"finalNetQuantity":5,"provisionalNetQuantity":5}')
R3=$(getfield "$(body "$r")" ".id")
HALF=$(node -e "console.log(Math.floor($EXPECTED_ADVANCE / 2))")
r=$(req POST /api/transactions/apply-advance "{\"partnerId\":1,\"targetReceiptId\":$R3,\"amount\":$HALF}")
[ "$(status "$r")" = "201" ] && ok "apply-advance 201 ($HALF din $EXPECTED_ADVANCE)" || ko "apply-advance status=$(status "$r") body=$(body "$r")"

r=$(req GET /api/partner-advances)
REMAIN2=$(node -e "const o=JSON.parse(process.argv[1]);console.log((o.partnerAdvances||[])[0]?.remainingAmount ?? '')" "$(body "$r")")
EXPECTED_REMAIN2=$(node -e "console.log($EXPECTED_ADVANCE - $HALF)")
[ "$REMAIN2" = "$EXPECTED_REMAIN2" ] && ok "remainingAmount redus la $REMAIN2 (asteptat $EXPECTED_REMAIN2)" || ko "remainingAmount=$REMAIN2"

echo "== Q4 login ca accountant → stockCorrection = 403 =="
# admin a schimbat parola pe admin, dar contabil inca are Agro2026! (default). Dar asta e in blacklist policy.
# seed users au requirePasswordChange=true, deci login merge dar schimbare e forțată.
# folosim admin sa reseteze parola pe contabil la ceva strict, apoi logout+login contabil
r=$(req PATCH /api/config/users/3 '{"password":"ParolaContabil2026","changeReason":"reset pentru smoke"}')
[ "$(status "$r")" = "200" ] && ok "reset parola contabil" || ko "reset: $(body "$r")"

# logout admin
r=$(req POST /api/auth/logout)
# login contabil
r=$(req POST /api/auth/login '{"username":"contabil","password":"ParolaContabil2026"}')
[ "$(status "$r")" = "200" ] && ok "login contabil" || ko "login contabil: $(body "$r")"

# contabil trebuie sa treaca de requirePasswordChange — admin-reset il seteaza
# pentru teste continuam; PATCH complaint stockCorrection → 403 (roleCode=accountant)
r=$(req POST /api/complaints "{\"deliveryId\":$DEL_ID,\"complaintType\":\"Lipsa cantitate\",\"contestedQuantity\":50}")
COMP2=$(getfield "$(body "$r")" ".id")

r=$(req PATCH "/api/complaints/$COMP2" "{\"status\":\"Acceptata\",\"stockCorrection\":{\"deliveryId\":$DEL_ID,\"deltaQuantity\":-50,\"note\":\"lipsa\"},\"changeReason\":\"ajustare contabil\"}")
[ "$(status "$r")" = "403" ] && ok "accountant BLOCAT pe stockCorrection (403)" || ko "status=$(status "$r") body=$(body "$r")"

echo "== Q4 accountant poate invoiceAdjustment =="
r=$(req PATCH "/api/complaints/$COMP2" '{"status":"Acceptata","invoiceAdjustment":{"type":"adjust","amount":-200,"note":"reducere pret"},"changeReason":"ajustare factura"}')
[ "$(status "$r")" = "200" ] && ok "accountant poate invoiceAdjustment (200)" || ko "status=$(status "$r") body=$(body "$r")"

echo ""
echo "=================================="
echo "REZULTAT: pass=$pass  fail=$fail"
echo "=================================="
exit "$fail"
