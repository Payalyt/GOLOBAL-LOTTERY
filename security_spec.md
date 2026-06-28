# Firestore Security Specifications

## 1. Data Invariants
1. **User Profiling Isolation**: A non-admin user must never be able to read or modify any other user's profile document under `/users/{email}`.
2. **Strict Field Immutability**: Users cannot self-modify sensitive balance or RBAC properties (`balance`, `winningsBalance`, `commissionBalance`, `role`) on their profile.
3. **Ledger Integrity**: Users cannot inject or modify arbitrary ledger files (`/depositRequests`, `/withdrawalRequests`) as "Approved". Only authorized administrators can perform transitions to "Approved" or "Rejected" states.
4. **Ticket Authenticity**: Users cannot buy or write tickets on behalf of other users (the `email` field of `/purchasedTickets/{ticketId}` must match the user's verified authenticated email).

---

## 2. The "Dirty Dozen" Malicious Payloads

### Payload 1: Privilege Escalation via User Profile Injection
**Target**: `users/payalyt6279@gmail.com`
**Vulnerability Attempted**: Overwriting own profile role to `admin` to gain access to the backoffice.
```json
{
  "name": "Attacker",
  "email": "payalyt6279@gmail.com",
  "balance": 1000000.00,
  "role": "admin"
}
```

### Payload 2: Bankroll Poisoning (Arbitrary Balance Crediting)
**Target**: `users/payalyt6279@gmail.com`
**Vulnerability Attempted**: Directly updating self-balance to $999,999.00 without any verified cash deposit ledger.
```json
{
  "balance": 999999.00
}
```

### Payload 3: Unauthorized Public Read of User Directory
**Target**: `users/md.meshkat200@gmail.com`
**Vulnerability Attempted**: A random user reading another user's personal profile data containing their PII (phone, NID/Passport numbers).
```json
[GET] /users/md.meshkat200@gmail.com (by user anonymous or payalyt6279@gmail.com)
```

### Payload 4: Fake Deposit Injection (Direct Ledger Hijack)
**Target**: `depositRequests/DEP-ATTACK`
**Vulnerability Attempted**: Directly writing a verified "Approved" deposit ticket to credit self wallet without admin verification.
```json
{
  "id": "DEP-ATTACK",
  "email": "payalyt6279@gmail.com",
  "amount": 50000.00,
  "gateway": "bKash",
  "transactionId": "FAKE_TRX_999",
  "date": "27/06/2026",
  "status": "Approved"
}
```

### Payload 5: Siphoning Winnings Wallet via Fake Withdrawal Injection
**Target**: `withdrawalRequests/WD-ATTACK`
**Vulnerability Attempted**: Injecting an already "Approved" withdrawal record directly to bypass verification controls.
```json
{
  "id": "WD-ATTACK",
  "email": "payalyt6279@gmail.com",
  "amount": 50000.00,
  "bankName": "bKash",
  "iban": "01986259552",
  "date": "27/06/2026",
  "status": "Approved"
}
```

### Payload 6: Ticket Spoofing (Purchasing under another user's account)
**Target**: `purchasedTickets/TKT-SPOOF`
**Vulnerability Attempted**: Writing a ticket record belonging to another user's email to steal or charge their credit balance.
```json
{
  "id": 829100,
  "numbers": [1, 2, 3, 4, 5, 6, 7],
  "price": 15,
  "gameName": "MEGA7",
  "purchaseDate": "27/06/2026 12:00",
  "email": "md.meshkat200@gmail.com",
  "status": "Pending"
}
```

### Payload 7: Fabricated Winner Announcement Placement
**Target**: `raffleWinners/w-malicious`
**Vulnerability Attempted**: Writing/placing a self-assigned raffle prize winner into the landing database directly as a standard client.
```json
{
  "id": "w-malicious",
  "name": "Attacker",
  "country": "Bangladesh",
  "flag": "🇧🇩",
  "ticket": "SR1-9999A",
  "prize": "$1,000,000.00",
  "game": "MEGA7",
  "avatarBg": "bg-red-500",
  "initials": "AT"
}
```

### Payload 8: Altering Game Cost & Mechanics
**Target**: `dynamicGames/MEGA7`
**Vulnerability Attempted**: A malicious user altering active game cost down to $0.01 and reducing total ball requirements to easily hit jackpots.
```json
{
  "price": 0.01,
  "ballCount": 1,
  "maxBallValue": 2
}
```

### Payload 9: Hijacking Global Payment Details & Wallets
**Target**: `siteConfigs/default`
**Vulnerability Attempted**: Modifying administrative payment details (e.g. `bkashNumber`, `usdtAddress`) to point to the attacker's wallet, redirecting future cash flows.
```json
{
  "bkashNumber": "+8801999999999",
  "usdtAddress": "attacker_usdt_wallet"
}
```

### Payload 10: Deleting Historical Draws Ledger
**Target**: `historicalDraws/HD-8291`
**Vulnerability Attempted**: A standard client deleting previous results lists to manipulate the user's dynamic statistical charts.
```json
[DELETE] /historicalDraws/HD-8291
```

### Payload 11: Direct State Mutator on Pending Tickets
**Target**: `purchasedTickets/TKT-1234`
**Vulnerability Attempted**: Direct update from "Pending" status to "Won" status with payout of "$50,000,000.00" on a self-owned ticket.
```json
{
  "status": "Won",
  "payout": "$50,000,000.00"
}
```

### Payload 12: Malformed ID Poisoning & Injection Denial of Wallet
**Target**: `users/malicious_ID_containing_10_kilobytes_of_garbage_characters_...`
**Vulnerability Attempted**: Creating a document containing extreme name sizes or non-alphanumeric unicode string overflows to cause index exhaustion.
```json
[CREATE] /users/junk$$$!!!*** (containing 1MB data payload)
```

---

## 3. Test Runner Concept (Verifying Denied Operations)
All threat vectors defined in the Dirty Dozen must result in `PERMISSION_DENIED` errors from Firestore rules and get logged cleanly by our `handleFirestoreError` handler.
