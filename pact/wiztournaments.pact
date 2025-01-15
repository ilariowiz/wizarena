(namespace "free")
(define-keyset "free.wiztournaments-keyset" (read-keyset "wiztournaments-keyset"))


(module wiztournaments ADMIN
    "Wizards Arena P2E Tournaments"

    (use coin)

    (defconst ADMIN_KEYSET "free.wiztournaments-keyset")
    (defconst ADMIN_ADDRESS "k:90f45921e0605560ace17ca8fbbe72df95ba7034abeec7a8a7154e9eda7114eb")
    (defconst DEV_ADDRESS "k:aa7903581556284374b67a395ca5d825765f2cb9c709230100669327cc67b3f1")
    (defconst WIZ_TOURNAMENT_BANK:string "wiz-tournament-bank" "Account holding buyins")

    (defcap PRIVATE ()
        @doc "can only be called from a private context"
        true
    )

    ;; checks that the transaction owner
    (defcap ACCOUNT_GUARD(account:string)
        @doc "Verifies account meets format and belongs to caller"
        (enforce (is-principal account) "")
        (enforce-guard (at "guard" (coin.details account)))
    )

    (defcap ADMIN() ; Used for admin functions
        @doc "Only allows admin to call these"
        (enforce-keyset ADMIN_KEYSET)
        (compose-capability (PRIVATE))
        (compose-capability (ACCOUNT_GUARD ADMIN_ADDRESS))
    )

    (defcap DEV () ; Used for admin functions
        @doc "Only allows dev to call these"
        (compose-capability (PRIVATE))
        (compose-capability (ACCOUNT_GUARD DEV_ADDRESS))
    )

    (defcap DEVS_CAP ()
        (enforce-one "Dev or Admin"
            [
                (enforce-keyset ADMIN_KEYSET)
                (enforce-guard (at "guard" (coin.details DEV_ADDRESS)))
            ]
        )
        (compose-capability (PRIVATE))
    )

    (defcap SEND_PRIZE (account:string amount:decimal)
        @event true
    )

    (defun create-BANK-guard ()
        (create-user-guard (require-PRIVATE))
    )

    (defun require-PRIVATE ()
        (require-capability (PRIVATE))
    )

    ;;;;;TABLES;;;;
    (defschema token-schema
        balance:decimal
        guard:guard
    )

    (defschema tournament-schema
        createdAt:time
        completed:bool
        completedAt:time
        id:string
        wizards:list
        buyin:decimal
        maxLevel:integer
        nPlayers:integer
    )

    (deftable tournament:{tournament-schema})
    (deftable token-table:{token-schema})

    (defun initialize()
        (coin.create-account WIZ_TOURNAMENT_BANK (create-BANK-guard))
        (create-account WIZ_TOURNAMENT_BANK (create-BANK-guard))
    )

    ; --------------------------------------------------------------------------
     ; STATE MODIFYING FUNCTIONS, REQUIRE CAPABILITIES
     ; --------------------------------------------------------------------------

       (defun create-account:string (account:string guard:guard)
         @doc "create new account"
         (enforce-reserved account guard)
         (insert token-table account {
             "balance": 0.0,
             "guard": guard
         })
       )

       (defun enforce-reserved:bool
       ( accountId:string
         guard:guard )
       @doc "Enforce reserved account name protocols."
       (let ((r (check-reserved accountId)))
         (if (= "" r) true
           (if (= "k" r)
             (enforce
               (= (format "{}" [guard])
                  (format "KeySet {keys: [{}],pred: keys-all}"
                          [(drop 2 accountId)]))
               "Single-key account protocol violation")
             (enforce false
               (format "Unrecognized reserved protocol: {}" [r]))))))

       (defun check-reserved:string (accountId:string)
           " Checks ACCOUNT for reserved name and returns type if \
           \ found or empty string. Reserved names start with a \
           \ single char and colon, e.g. 'c:foo', which would return 'c' as type."
           (let ((pfx (take 2 accountId)))
             (if (= ":" (take -1 pfx)) (take 1 pfx) "")))

       (defun enforce-account-exists (account:string)
           @doc "Enforces that an account exists in the coin table"
           (let ((coin-account (at "account" (coin.details account))))
               (enforce (= coin-account account) "account was not found")
           )
       )

     ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

     (defun create-tournament (tournamentname:string tournamentid:string buyin:decimal maxLevel:integer nPlayers:integer)
         (enforce (> buyin 0.0) "Buyin must be greater than 0")
         (enforce (> maxLevel 0) "Max Level must be greater than 0")
         (with-capability (DEVS_CAP)
             (write tournament tournamentname
                 {"id": tournamentid,
                 "createdAt": (at "block-time" (chain-data)),
                 "completedAt": (at "block-time" (chain-data)),
                 "completed": false,
                 "wizards": [],
                 "buyin":buyin,
                 "maxLevel": maxLevel,
                 "nPlayers": nPlayers}
             )
         )
     )

     (defun join-tournament (tournamentname:string idnfts:list account:string m:module{wizarena-interface-v2} mwiza:module{wiza1-interface-v4})
         (enforce (= (format "{}" [m]) "free.wiz-arena") "not allowed, security reason")
         (enforce (= (format "{}" [mwiza]) "free.wiza") "not allowed, security reason")
         (with-capability (ACCOUNT_GUARD account)
             (let (
                    (bank-guard (at "guard" (coin.details WIZ_TOURNAMENT_BANK)))
                 )
                 (with-read tournament tournamentname
                     {
                         "wizards":=wizards,
                         "buyin":=buyin,
                         "maxLevel":=maxLevel,
                         "nPlayers":=nPlayers
                     }
                     (enforce (< (length wizards) nPlayers) "Tournament is full")
                     (enforce (<= (+ (length wizards) (length idnfts)) nPlayers) "You can't subscribe that many wizards")
                     (map
                         (check-ownership-and-max-level account m maxLevel)
                         idnfts
                     )
                     (map
                         (check-double-sub wizards)
                         idnfts
                     )
                     (update tournament tournamentname
                         {
                             "wizards": (+ wizards idnfts)
                         }
                     )
                     (mwiza::transfer-create account WIZ_TOURNAMENT_BANK bank-guard (* buyin (length idnfts)))
                 )
             )
         )
     )

     (defun check-ownership-and-max-level (account:string m:module{wizarena-interface-v2} maxLevel:integer idnft:string)
        (enforce (= (format "{}" [m]) "free.wiz-arena") "not allowed, security reason")
       (let* (
               (nft-data (m::get-wizard-fields-for-id (str-to-int idnft)))
               (current-level (calculate-level nft-data))
           )
           (enforce (= (at "owner" nft-data) account) "You are not the owner of this wizard")
           ;(enforce (<= current-level maxLevel) "Your wizard has a level greater than the max level")
       )
     )

     (defun check-double-sub (wizards:list idnft:string)
        (enforce (= (contains idnft wizards) false) "This wizard is already subscribed")
     )

     (defun calculate-level (data:object)
         (let (
                 (hp (at "hp" data))
                 (def (at "defense" data))
                 (atk (at "attack" data))
                 (dmg (at "damage" data))
                 (speed (at "speed" data))
             )
             (round(+ (+ (+ (+ (+ hp (* def 4.67)) (* atk 4.67)) (* dmg 2.67)) (* speed 2.67)) 0.000001))
         )
     )

     (defun complete-tournament (tournamentname:string winners:list fee:decimal m:module{wiza1-interface-v4})
         (enforce (= (format "{}" [m]) "free.wiza") "not allowed, security reason")
         (with-capability (DEVS_CAP)
             (send-prizes winners fee m)
             (update tournament tournamentname
                 {
                     "completed":true,
                     "completedAt": (at "block-time" (chain-data))
                 }
             )
         )
     )

     (defun send-prizes (winners:list fee:decimal m:module{wiza1-interface-v4})
        (enforce (= (format "{}" [m]) "free.wiza") "not allowed, security reason")
         (require-capability (DEVS_CAP))
         (let (
                (admin-guard (at "guard" (coin.details ADMIN_ADDRESS)))
             )
             (install-capability (m::TRANSFER WIZ_TOURNAMENT_BANK ADMIN_ADDRESS fee))
             (m::transfer-create WIZ_TOURNAMENT_BANK ADMIN_ADDRESS admin-guard fee)
             (map
                 (send-prize m)
                 winners
             )
         )
     )

     (defun send-prize (m:module{wiza1-interface-v4} item:object)
         (require-capability (PRIVATE))
         (let* (
               (address (at "address" item))
               (prize (at "prize" item))
               (receiver-guard (at "guard" (coin.details address)))
             )
             (enforce (> prize 0.0) "prize must be greater than 0")
             (install-capability (m::TRANSFER WIZ_TOURNAMENT_BANK address prize))
             (m::transfer-create WIZ_TOURNAMENT_BANK address receiver-guard prize)

             (with-default-read token-table WIZ_TOURNAMENT_BANK
               {"balance": 0.0}
               {"balance":= wizbalance }
               (update token-table WIZ_TOURNAMENT_BANK {"balance": (- wizbalance prize)})
             )

             (emit-event (SEND_PRIZE address prize))
         )
     )

     (defun get-tournament-info (tournamentname:string)
         (read tournament tournamentname)
     )
)

(if (read-msg "upgrade")
  ["upgrade"]
  [
    (create-table tournament)
    (create-table token-table)

    (initialize)
  ]
)
