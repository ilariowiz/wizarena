(namespace "free")
(define-keyset "free.wizarena-keyset" (read-keyset "wizarena-keyset"))

(module wiz-arena ADMIN
  "Wizards Arena NFTs"

    (use coin)

  ; --------------------------------------------------------------------------
 ; Constants
; --------------------------------------------------------------------------

    (defconst MINTED_POST_COUNT_KEY "minted-post-count-key")
    (defconst MINTED_COUNT_KEY "minted-count-key")
    (defconst NFTS_COUNT_KEY "nfts-count-key")
    (defconst VOLUME_PURCHASE_COUNT "volume_purchase_count")
    (defconst MINT_CHAIN_ID_KEY "mint-chain-id-key")
    (defconst PRICE_KEY "price-key")
    (defconst BUYIN_KEY "buyin-key")
    (defconst FEE_KEY "fee-key")
    (defconst FEE_TOURNAMENT_KEY "fee-tournament-key")
    (defconst ADMIN_KEYSET "free.wizarena-keyset")
    (defconst ADMIN_ADDRESS "k:90f45921e0605560ace17ca8fbbe72df95ba7034abeec7a8a7154e9eda7114eb")
    (defconst CLERIC_MINT_ADDRESS "k:9ca8b0b628eb386edafcb66cb90cfd79f349433502e1c1dece1fa097f6801250")
    ;(defconst MAX_ITEMS_PER_OWNER "max-items-per-owner")
    (defconst WIZ_BANK:string "wiz-bank" "Account holding prizes")

    ;(defconst WIZ_REVEAL "wiz-reveal")

    (defconst TOURNAMENT_OPEN "tournament_open")

    (defconst LEVEL_CAP 300)

    (defconst MINT_PHASE "mint-phase")

    (defconst PVP_OPEN "pvp-open")
    (defconst PVP_WEEK "pvp-week")

    (defconst ID_REVEAL "id-reveal")

    (defconst WIZARDS_OFFERS_COUNT_KEY "wizards-offers-count-key")
    (defconst WIZARDS_OFFERS_BANK:string "wizards-offers-bank" "Account holding offers")

; --------------------------------------------------------------------------
; Capabilities
; --------------------------------------------------------------------------

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

    ;; checks the owner of the nft
    (defcap OWNER (account:string id:string)
        @doc "Enforces that an account owns the nft"
        (let
            (
                (nft-owner (at "owner" (read nfts id ["owner"])))
            )
            (enforce (= nft-owner account) "Account is not owner of the NFT")
            (compose-capability (ACCOUNT_GUARD account))
        )
    )

    (defcap ADMIN() ; Used for admin functions
        @doc "Only allows admin to call these"
        (enforce-keyset ADMIN_KEYSET)
        (compose-capability (PRIVATE))
        (compose-capability (ACCOUNT_GUARD ADMIN_ADDRESS))
    )

    (defun create-BANK-guard ()
        (create-user-guard (require-PRIVATE))
    )

    (defun require-PRIVATE ()
        (require-capability (PRIVATE))
    )

    (defcap WIZ_BUY (id:string buyer:string seller:string price:decimal)
        @doc "Emitted event when a Wizard is purchased"
        @event true
    )

    (defcap TOURNAMENT_SUBSCRIPTION (id:string tournament:string)
        @doc "Emitted event when a Wizard signs up for the tournament"
        @event true
    )

    (defcap WITHDRAW_PRIZE (winner:string prize:decimal)
        @event true
    )

    (defcap BURN_NFT (id:string)
        @event true
    )

    (defcap BUY_UPGRADE (id:string stat:string increment:integer wiza-cost:decimal owner:string)
        @event true
    )

 ; --------------------------------------------------------------------------
  ; Schema and tables
  ; --------------------------------------------------------------------------

    ;;;; SCHEMAS AND TABLES ;;;;;
    (defschema nft-main-schema
        @doc "Stores core information about each nft"
        id:string
        created:time
        traits:list
        owner:string
        name:string
        imageHash:string
    )

    (defschema nft-listed-schema
        @doc "stores info about list and price of nft"
        id:string
        listed:bool
        price:decimal
    )

    (defschema creation-schema
        @doc "Initial nft creation"
        traits:list
        name:string
        imageHash:string
    )

    ; (defschema account-minted-schema
    ;     @doc "keeps track of how many nfts an account has minted"
    ;     minted:integer
    ; )

    (defschema counts-schema
        @doc "Basic schema used for counting things"
        count:integer
    )

    (defschema volume-schema
        @doc "Basic schema used for counting volume"
        count:decimal
    )

    (defschema values-schema
        @doc "Basic schema used for storing basic values"
        value:string
    )

    ; (defschema max-items-schema
    ;     @doc "Max items schema during mint time"
    ;     max:integer
    ; )

    (defschema token-schema
        balance:decimal
        guard:guard
    )

    (defschema tournament-sub-schema
        round:string
        idnft:string
        address:string
    )

    (defschema values-tournament-schema
        @doc "Buyin schema"
        value:decimal
    )

    (defschema prizes-schema
        balance:decimal
    )

    (defschema stats-schema
        id:string
        attack:integer
        damage:integer
        weakness:string
        defense:integer
        element:string
        fights:list
        hp:integer
        medals:object
        resistance:string
        spellSelected:object
        spellbook:list
    )

    (defschema upgrade-stat-values-schema
        value:decimal
    )

    (defschema burning-queue-schema
        burned:bool
        confirmBurn:bool
        idnft:string
        account:string
        timestamp:time
    )

    (defschema free-mint-list-schema
        amount:integer
    )

    (defschema wl-mint-schema
        amount:integer
    )

    (defschema account-free-minted-clerics-schema
        @doc "keeps track of how many clerics an account has minted for free"
        minted:integer
    )

    (defschema account-minted-clerics-schema
        @doc "keeps track of how many clerics an account has minted"
        minted:integer
    )

    (defschema price-schema
        @doc "Prices schema"
        price:decimal
    )

    ;key = pvpweek_idnft
    (defschema pvp-subscribers-schema
        @doc "PVP subscribers schema"
        pvpweek:string
        idnft:string
        address:string
        spellSelected:object
    )

    (defschema offers-schema
        @doc "schema for offers on marketplace"
        id:string
        refnft:string
        buyer:string
        owner:string
        timestamp:time
        expiresat:time
        amount:decimal
        withdrawn:bool
        status:string
    )

    (deftable nfts:{nft-main-schema})
    (deftable nfts-market:{nft-listed-schema})
    (deftable creation:{creation-schema})
    (deftable counts:{counts-schema})
    (deftable values:{values-schema})
    (deftable volume:{volume-schema})
    ;(deftable max-items:{max-items-schema})
    (deftable token-table:{token-schema})
    (deftable tournaments:{tournament-sub-schema})
    (deftable values-tournament:{values-tournament-schema})
    (deftable prizes:{prizes-schema})
    (deftable stats:{stats-schema})
    (deftable upgrade-stat-values:{upgrade-stat-values-schema})
    (deftable burning-queue-table:{burning-queue-schema})

    (deftable free-mint-table:{free-mint-list-schema})
    (deftable wl-mint-table:{wl-mint-schema})
    (deftable account-free-minted-clerics:{account-free-minted-clerics-schema})
    (deftable account-minted-clerics:{account-minted-clerics-schema})
    (deftable price:{price-schema})

    (deftable pvp-subscribers:{pvp-subscribers-schema})

    (deftable offers-table:{offers-schema})

    ; --------------------------------------------------------------------------
  ; Can only happen once
  ; --------------------------------------------------------------------------

    (defun initialize ()
        @doc "Initialize the contract the first time its loaded "
        (insert counts MINTED_POST_COUNT_KEY {"count": 0})
        (insert counts MINTED_COUNT_KEY {"count": 0})
        (insert counts NFTS_COUNT_KEY {"count": 0})
        (insert volume VOLUME_PURCHASE_COUNT {"count": 0.0})
        (insert values MINT_CHAIN_ID_KEY {"value": "1"})
        (insert values-tournament BUYIN_KEY {"value": 4.0})
        (insert values-tournament FEE_KEY {"value": 7.0})
        (insert values-tournament FEE_TOURNAMENT_KEY {"value": 20.0})
        ;(insert max-items MAX_ITEMS_PER_OWNER {"max": 0})

        ;(insert values WIZ_REVEAL {"value": "0"})
        (insert values TOURNAMENT_OPEN {"value": "0"})

        (coin.create-account WIZ_BANK (create-module-guard "wiz-holdings"))
        (create-account WIZ_BANK (create-module-guard "wiz-holdings"))

        (insert values MINT_PHASE {"value": "-1"})
        (insert price PRICE_KEY {"price": 10.0})

        (insert values PVP_OPEN {"value":"0"})
        (insert values PVP_WEEK {"value":"w1"})

        (insert values ID_REVEAL {"value":"1024"})

        (insert counts WIZARDS_OFFERS_COUNT_KEY {"count": 0})
        (coin.create-account WIZARDS_OFFERS_BANK (create-BANK-guard))
        (create-account WIZARDS_OFFERS_BANK (create-BANK-guard))
    )

    (defun insertValuesUpgrade ()
        (insert upgrade-stat-values "hp" {"value": 61.0})
        (insert upgrade-stat-values "defense" {"value": 19.0})
        (insert upgrade-stat-values "attack" {"value": 9.0})
        (insert upgrade-stat-values "damage" {"value": 7.0})
        (insert upgrade-stat-values "hp_base_cost" {"value": 150.0})
        (insert upgrade-stat-values "defense_base_cost" {"value": 700.0})
        (insert upgrade-stat-values "attack_base_cost" {"value": 700.0})
        (insert upgrade-stat-values "damage_base_cost" {"value": 400.0})
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


    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    ;:;;;;;;; NFT CREATION , ADMIN ONLY ;;;;
    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

    (defun create-all-wizards (objects-list:list)
        @doc "take a list of multiple wizards, and create each wizard"
        (with-capability (ADMIN)
            (map
                (create-wizards)
                objects-list
            )
        )
    )

    (defun create-wizards (item-list:object)
        @doc "take a list of traits, to create a wizard"
        (require-capability (ADMIN))
        (let
            (
                (id (int-to-str 10(get-count NFTS_COUNT_KEY)))
                (wizcount (get-count NFTS_COUNT_KEY))
            )
            (insert creation id
                {"traits": (at "attributes" item-list),
                "name": (at "name" item-list),
                "imageHash": (at "imageHash" item-list)}
            )
        )
        (increase-count NFTS_COUNT_KEY)
    )

    (defun add-stats (objects-list:list)
        (with-capability (ADMIN)
            (map
                (add-stat)
                objects-list
            )
        )
    )

    (defun add-stat (item:object)
        (require-capability (ADMIN))
        (let
            (
                (id (at "id" item))
            )
            (insert stats id
                {"id": id,
                "attack": (at "attack" item),
                "damage": (at "damage" item),
                "weakness": (at "weakness" item),
                "defense": (at "defense" item),
                "element": (at "element" item),
                "fights": (at "fights" item),
                "hp": (at "hp" item),
                "medals": (at "medals" item),
                "resistance": (at "resistance" item),
                "spellSelected": (at "spellSelected" item),
                "spellbook": (at "spellbook" item)}
            )
        )
    )

    (defun update-stats (objects-list:list)
        (with-capability (ADMIN)
            (map
                (update-stat)
                objects-list
            )
        )
    )

    (defun update-stat (item:object)
        (require-capability (ADMIN))
        (let
            (
                (id (at "id" item))
            )
            (update stats id
                {"id": id,
                "attack": (at "attack" item),
                "damage": (at "damage" item),
                "defense": (at "defense" item),
                "hp": (at "hp" item)}
            )
        )
    )

    (defun update-spellbooks (objects-list:list)
        (with-capability (ADMIN)
            (map
                (update-spellbook)
                objects-list
            )
        )
    )

    (defun update-spellbook (item:object)
        (require-capability (ADMIN))
        (let
            (
                (id (at "id" item))
            )
            (update stats id
                {"id": id,
                "spellbook": (at "spellbook" item)}
            )
        )
    )

    (defun update-fights-medals (objects-list:list)
        (with-capability (ADMIN)
            (map
                (update-fight-medal)
                objects-list
            )
        )
    )

    (defun update-fight-medal (item:object)
        (require-capability (ADMIN))
        (let
            (
                (id (at "id" item))
            )
            (update stats id
                {"id": id,
                "fights": (at "fights" item),
                "medals": (at "medals" item)}
            )
        )
    )

    (defun update-hps (objects-list:list)
        (with-capability (ADMIN)
            (map
                (update-hp)
                objects-list
            )
        )
    )

    (defun update-hp (item:object)
        (require-capability (ADMIN))
        (let
            (
                (id (at "id" item))
            )
            (update stats id
                {"id": id,
                "hp": (at "hp" item)}
            )
        )
    )

    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    ;;;;;;;; MINT CLERICS FUN ;;;;;;;;;;;;
    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

    (defun get-clerics (owner:string amount:integer)
        @doc "Mint part 1"
        (enforce (>= amount 1) "Must mint at least 1 wizard")
        (let (
                (wiz-minted (get-count MINTED_COUNT_KEY))
                (wiz-created (get-count NFTS_COUNT_KEY))
                (mint-phase (get-value MINT_PHASE))
                (max-per-mint-phase (get-max-items-clerics owner (get-value MINT_PHASE)))
                (mint-price (get-mint-price))
                (minted (get-minted (get-value MINT_PHASE) owner))
            )
            (enforce (!= mint-phase "-1") "Too early to mint")
            (enforce (<= (+ wiz-minted amount) wiz-created) "Tried to mint more wiz then available! Please reduce the amount")
            (enforce (>= (- max-per-mint-phase amount) minted) "Exceed max mint per wallet")
            ; se è fase 1 o 2, fase 0 = free mint
            (if
                (!= mint-phase "0")
                [
                  (install-capability (coin.TRANSFER owner CLERIC_MINT_ADDRESS (* mint-price amount)))
                  (coin.transfer owner CLERIC_MINT_ADDRESS (* mint-price amount))
                ]
                "Admin address"
            )
            ;l'update su quanti ne hai mintati lo facciamo solo nella fase 1 ovvero WL, perché nella prima fase free, minti tutti quelli che hai
            ; in public non importa quanti ne hai
            (if
                (= mint-phase "0")
                (with-default-read account-free-minted-clerics owner
                  {"minted": 0}
                  {"minted":= minted }
                  (write account-free-minted-clerics owner {"minted": (+ minted amount)})
                )
                ""
            )
            (if
                (= mint-phase "1")
                (with-default-read account-minted-clerics owner
                  {"minted": 0}
                  {"minted":= minted }
                  (write account-minted-clerics owner {"minted": (+ minted amount)})
                )
                ""
            )
            (with-capability (ACCOUNT_GUARD owner)
                (with-capability (PRIVATE)
                    (increase-volume-by VOLUME_PURCHASE_COUNT (* mint-price amount))
                    (if
                        ; if during WL you mint 9 NFT, the tenth is free
                        (= mint-phase "1")
                        (with-default-read account-minted-clerics owner
                          {"minted": 0}
                          {"minted":= minted }
                          (if
                              (= minted 9)
                              (map
                                  (get-cleric owner)
                                  (make-list (+ amount 1) 1)
                              )
                              (map
                                  (get-cleric owner)
                                  (make-list amount 1)
                              )
                          )
                        )
                        (map
                            (get-cleric owner)
                            (make-list amount 1)
                        )
                    )
                )
            )
        )
    )

    (defun get-cleric (owner:string number:integer)
        @doc "Mint part 2"
        (enforce (= number 1) "Number enforced to be 1 to avoid confusion but allow mapping to work")
        (require-capability (PRIVATE))
        (require-capability (ACCOUNT_GUARD owner))
        (let (
                (id (id-for-new-wizard))
            )
            (let (
                    (data (get-latest-wizard-data id))
                )
                (mint-cleric id {
                    "id": id,
                    "created": (at "block-time" (chain-data)),
                    "traits": (at "traits" data),
                    "owner": owner,
                    "name": (at "name" data),
                    "imageHash": (at "imageHash" data)
                })
            )
        )
        (increase-count MINTED_COUNT_KEY)
    )

    (defun mint-cleric (id:string data:object)
        @doc "Mint part 3"
        (require-capability (PRIVATE))
        (insert nfts id data)
        (insert nfts-market id {
            "id": id,
            "price": 0.0,
            "listed": false
        })
        (increase-count MINTED_POST_COUNT_KEY)
    )

    (defun get-max-items-clerics (address:string phase:string)
        (cond
            (
                (= phase "0")
                (at "amount" (read free-mint-table address ['amount]))
            )
            (
                (= phase "1")
                (at "amount" (read wl-mint-table address ['amount]))
            )
            (
                (= phase "2")
                200
            )
        "")
    )

    (defun get-minted (phase:string owner:string)
        (cond
            (
                (= phase "0")
                (with-default-read account-free-minted-clerics owner
                    {"minted": 0}
                    {"minted":= minted }
                    minted
                )
            )
            (
                (= phase "1")
                (with-default-read account-minted-clerics owner
                    {"minted": 0}
                    {"minted":= minted }
                    minted
                )
            )
            (
                (= phase "2")
                0
            )
        "")
    )

    (defun add-users-free-mint (accounts:list)
        (with-capability (ADMIN)
            (map
                (add-user-free-mint)
                accounts
            )
        )
    )

    (defun add-user-free-mint (data:object)
        (require-capability (ADMIN))
        (let (
                (address (at "address" data))
                (amount (at "amount" data))
            )
            (write free-mint-table address { "amount": amount })
        )
    )

    (defun add-users-wl-mint (accounts:list)
        (with-capability (ADMIN)
            (map
                (add-user-wl-mint)
                accounts
            )
        )
    )

    (defun add-user-wl-mint (data:object)
        (require-capability (ADMIN))
        (let (
                (address (at "address" data))
                (amount (at "amount" data))
            )
            (write wl-mint-table address { "amount": amount })
        )
    )

    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    ;;;;;;;; MINT FUN ;;;;;;;;;;;;
    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

    ; (defun set-max-items(max:integer)
    ;     @doc "Set the max items per address"
    ;     (with-capability (ADMIN)
    ;         (update max-items MAX_ITEMS_PER_OWNER {"max": max})
    ;     )
    ; )
    ;
    ; (defun get-wizards (owner:string amount:integer)
    ;     @doc "Mint part 1"
    ;     (enforce (>= amount 1) "Must mint at least 1 wizard")
    ;     (let (
    ;             (wiz-minted (get-count MINTED_COUNT_KEY))
    ;             (wiz-created (get-count NFTS_COUNT_KEY))
    ;             (max-items (get-max-items))
    ;         )
    ;         (enforce (> max-items 0) "Too early to mint")
    ;         (enforce (<= (+ wiz-minted amount) wiz-created) "Tried to mint more wiz then available! Please reduce the amount")
    ;         (with-default-read account-minted owner
    ;             {"minted": 0}
    ;             {"minted":= minted }
    ;             (enforce (>= (- max-items amount) minted) "Exceed max mint per wallet")
    ;         )
    ;     )
    ;     (with-default-read account-minted owner
    ;       {"minted": 0}
    ;       {"minted":= minted }
    ;       (write account-minted owner {"minted": (+ minted amount)})
    ;     )
    ;     (with-capability (ACCOUNT_GUARD owner)
    ;         (with-capability (PRIVATE)
    ;             (map
    ;                 (get-wizard owner)
    ;                 (make-list amount 1)
    ;             )
    ;         )
    ;     )
    ; )
    ;
    ; (defun get-wizard (owner:string number:integer)
    ;     @doc "Mint part 2"
    ;     (enforce (= number 1) "Number enforced to be 1 to avoid confusion but allow mapping to work")
    ;     (require-capability (PRIVATE))
    ;     (require-capability (ACCOUNT_GUARD owner))
    ;     (let (
    ;             (id (id-for-new-wizard))
    ;         )
    ;         (let (
    ;                 (data (get-latest-wizard-data id))
    ;             )
    ;             (mint-wizard id {
    ;                 "id": id,
    ;                 "created": (at "block-time" (chain-data)),
    ;                 "traits": (at "traits" data),
    ;                 "owner": owner,
    ;                 "name": (at "name" data),
    ;                 "imageHash": (at "imageHash" data)
    ;             })
    ;         )
    ;     )
    ;     (increase-count MINTED_COUNT_KEY)
    ; )
    ;
    ; (defun mint-wizard (id:string data:object)
    ;     @doc "Mint part 3"
    ;     (require-capability (PRIVATE))
    ;     (insert nfts id data)
    ;     (insert nfts-market id {
    ;         "id": id,
    ;         "price": 0.0,
    ;         "listed": false
    ;     })
    ;     (increase-count MINTED_POST_COUNT_KEY)
    ; )

    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    ;;;; MARKTEPLACE FUN ;;;;
    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

    (defun list-wizard (sender:string id:string price:decimal m:module{wiza1-interface-v1})
        @doc "list a wizard on marketplace"
        (enforce (>= price 1.0) "amount must be equal or greater then 1")
        (enforce (= (format "{}" [m]) "free.wiza") "not allowed, security reason")
        (let (
                (data (get-wizard-fields-for-id (str-to-int id)))
                (is-staked (check-is-staked id m))
            )
            (enforce (= (at "listed" data) false) "this wizard is already listed")
            (enforce (= is-staked false) "You can't list a staked wizard")
            (enforce (= (at "confirmBurn" data) false) "You can't list a wizard in burning queue")
        )
        (with-capability (OWNER sender id)
            (update nfts-market id {"listed": true, "price": price})
        )
    )

    (defun delist-wizard (sender:string id:string)
        @doc "delist a wizard on marketplace"
        (let (
                (data (get-wizard-fields-for-id (str-to-int id)))
            )
            (enforce (= (at "listed" data) true) "this wizard is not listed")
        )
        (with-capability (OWNER sender id)
            (update nfts-market id {"listed": false, "price": 0.0})
        )
    )

    (defun buy-wizard (id:string newowner:string)
        @doc "buy a wizard from marketplace"
        (let (
                (currentowner (read nfts id ['owner]))
                (market-data (read nfts-market id ['listed 'price]))
            )
            (enforce (= (at "listed" market-data) true) "this wizard is not listed")
            (enforce (> (at "price" market-data) 0.0) "the price is not valid")
            (enforce (!= (at "owner" currentowner) newowner) "the buyer can't be the owner")
            (let (
                    (fee (/ (* (get-value-tournament FEE_KEY) (at "price" market-data)) 100))
                )
                (with-capability (ACCOUNT_GUARD newowner)
                  (install-capability (coin.TRANSFER newowner (at "owner" currentowner) (- (at "price" market-data) fee)))
                  (coin.transfer newowner (at "owner" currentowner) (- (at "price" market-data) fee))
                  (install-capability (coin.TRANSFER newowner ADMIN_ADDRESS fee))
                  (coin.transfer newowner ADMIN_ADDRESS fee)
                  (update nfts id {
                    "owner": newowner
                  })
                  (update nfts-market id {
                    "price": 0.0,
                    "listed": false
                  })
                  (emit-event (WIZ_BUY id newowner (at "owner" currentowner) (at "price" market-data)))
                  (with-capability (PRIVATE)
                      (increase-volume-by VOLUME_PURCHASE_COUNT (at "price" market-data))
                  )
                )
            )
        )
    )

    (defun make-offer (refnft:string buyer:string duration:integer amount:decimal)
        @doc "make an offer for a nft"
        (enforce (> amount 0.0) "Amount must be greater then zero")
        (enforce (> duration 0) "Duration must be at least 1 day")
        (let (
            (currentowner (at "owner" (read nfts refnft ["owner"])))
            (new-offer-id (int-to-str 10 (get-count WIZARDS_OFFERS_COUNT_KEY)))
          )
          (enforce (!= currentowner buyer) "the buyer can't be the owner")
          (with-capability (ACCOUNT_GUARD buyer)
            (install-capability (coin.TRANSFER buyer WIZARDS_OFFERS_BANK amount))
            (coin.transfer buyer WIZARDS_OFFERS_BANK amount)
            (insert offers-table new-offer-id {
              "id": new-offer-id,
              "refnft": refnft,
              "buyer": buyer,
              "owner": currentowner,
              "timestamp": (at "block-time" (chain-data)),
              "expiresat": (add-time (at "block-time" (chain-data)) (days duration)),
              "amount": amount,
              "withdrawn": false,
              "status": "pending"
            })
            (with-default-read token-table WIZARDS_OFFERS_BANK
              {"balance": 0.0}
              {"balance":= oldbalance }
              (update token-table WIZARDS_OFFERS_BANK {"balance": (+ oldbalance amount)})
            )
            (with-capability (PRIVATE)
              (increase-count WIZARDS_OFFERS_COUNT_KEY)
            )
          )
        )
    )

    (defun cancel-offer (idoffer:string)
      @doc "cancel offer"

      (with-read offers-table idoffer
        {
          "buyer" := buyer,
          "expiresat" := expiresat,
          "amount" := amount,
          "withdrawn" := iswithdrew
        }
        ; enforce some rules
        (with-capability (ACCOUNT_GUARD buyer)
          (enforce (= iswithdrew false) "Cannot withdraw twice")
          (enforce (<= expiresat (at "block-time" (chain-data))) "Cannot cancel offer yet.")
          (with-capability (PRIVATE)
            (install-capability (coin.TRANSFER WIZARDS_OFFERS_BANK buyer amount))
            (coin.transfer WIZARDS_OFFERS_BANK buyer amount)

            (update offers-table idoffer { "withdrawn": true, "status": "canceled" })
            (with-default-read token-table WIZARDS_OFFERS_BANK
              {"balance": 0.0}
              {"balance":= oldbalance }
              (update token-table WIZARDS_OFFERS_BANK {"balance": (- oldbalance amount)})
            )
          )
        )
      )
    )

    (defun accept-offer (idoffer:string m:module{wiza1-interface-v1})
      @doc "Accept an offer"
      (enforce (= (format "{}" [m]) "free.wiza") "not allowed, security reason")
      (with-read offers-table idoffer
        {
          "refnft" := refnft,
          "buyer" := buyer,
          "timestamp" := timestamp,
          "expiresat" := expiresat,
          "amount" := amount,
          "withdrawn" := iswithdrew
        }
        (let (
                (data (get-wizard-fields-for-id (str-to-int refnft)))
                (is-staked (check-is-staked refnft m))
            )
            (enforce (= is-staked false) "You can't accept offers if a wizard is staked")
            (enforce (= (at "confirmBurn" data) false) "You can't accept offers if a wizard is in burning queue")
            (enforce (= iswithdrew false) "Cannot withdraw twice")
            (enforce (>= expiresat (at "block-time" (chain-data))) "Offer expired.")

            (with-capability (OWNER (at "owner" data) refnft)
                (let (
                    (fee (/ (* (get-value-tournament FEE_KEY) amount) 100))
                  )
                  (install-capability (coin.TRANSFER WIZARDS_OFFERS_BANK (at "owner" data) (- amount fee)))
                  (with-capability (PRIVATE)(coin.transfer WIZARDS_OFFERS_BANK (at "owner" data) (- amount fee)))

                  (install-capability (coin.TRANSFER WIZARDS_OFFERS_BANK ADMIN_ADDRESS fee))
                  (with-capability (PRIVATE)(coin.transfer WIZARDS_OFFERS_BANK ADMIN_ADDRESS fee))

                  (update offers-table idoffer { "withdrawn": true, "status": "accepted" })

                  (with-default-read token-table WIZARDS_OFFERS_BANK
                    {"balance": 0.0}
                    {"balance":= oldbalance }
                    (update token-table WIZARDS_OFFERS_BANK {"balance": (- oldbalance amount)})
                  )
                  (update nfts refnft {
                    "owner": buyer
                  })
                  (update nfts-market refnft {
                    "price": 0.0,
                    "listed": false
                  })

                )
                (with-capability (PRIVATE)
                    (emit-event (WIZ_BUY refnft buyer (at "owner" data) amount))
                    (increase-volume-by VOLUME_PURCHASE_COUNT amount)
                )
            )
        )
      )
    )

    (defun increase-volume-by (key:string amount:decimal)
        (require-capability (PRIVATE))
        (update volume key
            {"count": (+ amount (get-volume))}
        )
    )

    (defun get-offers-for-id (id:string)
      @doc "Get all offers for a single nft"
      (select offers-table (and?
                            (where "refnft" (= id))
                            (where "withdrawn" (= false))
                            ))
    )

    (defun get-offers-for-buyer (buyer:string)
      @doc "Get all offers made by a single buyer"
      (select offers-table (and?
                            (where "status" (!= "canceled")) ;se già ritirata non la prendiamo
                            (where "buyer" (= buyer))))
    )

    (defun get-offers-for-owner (owner:string)
      @doc "Get all offers received from owner"
      (select offers-table (and?
                            (where "owner" (= owner))
                            (where "withdrawn" (= false))))
    )

    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    ;;;;;; TOURNAMENT ;;;;;;;;;
    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

    ;round = tournament number
    (defun subscribe-tournament (id:string round:string idnft:string address:string spellSelected:object)
        @doc "Subscribe a wizard to tournament"
        (let (
                (tournament-open (get-value TOURNAMENT_OPEN))
                (data-wiz (get-wizard-fields-for-id (str-to-int idnft)))
            )
            (enforce (= tournament-open "1") "Tournament registrations are closed")
            (enforce (= (at "confirmBurn" data-wiz) false) "You can't subscribe a wizard in burning queue")
        )
        (with-default-read tournaments id
            {"idnft": ""}
            {"idnft":= idnft }
            (enforce (= (length idnft) 0) "Already subscribed to this tournament")
        )
        (let (
                (buyin (get-value-tournament BUYIN_KEY))
                (feebuyin (/ (* (get-value-tournament BUYIN_KEY) (get-value-tournament FEE_TOURNAMENT_KEY)) 100))
            )

            (with-capability (OWNER address idnft)
                (install-capability (coin.TRANSFER address ADMIN_ADDRESS feebuyin))
                (coin.transfer address ADMIN_ADDRESS feebuyin)
                (install-capability (coin.TRANSFER address WIZ_BANK (- buyin feebuyin)))
                (coin.transfer address WIZ_BANK (- buyin feebuyin))
                (insert tournaments id {
                    "round": round,
                    "idnft": idnft,
                    "address": address
                })
                (with-default-read token-table WIZ_BANK
                  {"balance": 0.0}
                  {"balance":= oldbalance }
                  (update token-table WIZ_BANK {"balance": (+ oldbalance (- buyin feebuyin))})
                )
                (update stats idnft {
                  "spellSelected": spellSelected
                })
                (emit-event (TOURNAMENT_SUBSCRIPTION idnft round))
            )
        )
    )

    (defun send-prizes (winners:list)
        (with-capability (ADMIN)
            (map
                (send-prize)
                winners
            )
        )
    )

    (defun send-prize (item:object)
        (require-capability (ADMIN))
        (let (
              (address (at "address" item))
              (prize (at "prize" item))
            )
            (enforce (> prize 0.0) "prize must be greater than 0")
            (install-capability (coin.TRANSFER WIZ_BANK address prize))
            (coin.transfer WIZ_BANK address prize)

            (with-default-read token-table WIZ_BANK
              {"balance": 0.0}
              {"balance":= wizbalance }
              (update token-table WIZ_BANK {"balance": (- wizbalance prize)})
            )
            (emit-event (WITHDRAW_PRIZE address prize))
        )
    )

    (defun get-subscription (id:string)
        @doc "Check if id is subscribed for tournament"
        (read tournaments id)
    )

    (defun get-all-subscription-for-tournament (idtournament:string)
        @doc "Get all subscribers for a single tournament"
        (select tournaments (where "round" (= idtournament)))
    )

    ; (defun set-prizes (winners:list)
    ;     (with-capability (ADMIN)
    ;         (map
    ;             (set-prize)
    ;             winners
    ;         )
    ;     )
    ; )
    ;
    ; (defun set-prize (item:object)
    ;     (require-capability (ADMIN))
    ;
    ;     (with-default-read prizes (at "address" item)
    ;       {"balance": 0.0}
    ;       {"balance":= oldbalance }
    ;       (write prizes (at "address" item) {"balance": (+ oldbalance (at "prize" item))})
    ;     )
    ; )

    ; (defun check-address-for-prize (address:string)
    ;     (at "balance" (read prizes address ["balance"]))
    ; )

    ; (defun withdraw-prize (account:string)
    ;     (with-capability (ACCOUNT_GUARD account)
    ;         (with-default-read prizes account
    ;           {"balance": 0.0}
    ;           {"balance":= oldbalance }
    ;           (enforce (> oldbalance 0.0) "you already withdrawn your prize")
    ;           (install-capability (coin.TRANSFER WIZ_BANK account oldbalance))
    ;           (coin.transfer WIZ_BANK account oldbalance)
    ;           (write prizes account {"balance": 0.0})
    ;           (emit-event (WITHDRAW_PRIZE account oldbalance))
    ;
    ;           (with-default-read token-table WIZ_BANK
    ;             {"balance": 0.0}
    ;             {"balance":= wizbalance }
    ;             (update token-table WIZ_BANK {"balance": (- wizbalance oldbalance)})
    ;           )
    ;         )
    ;     )
    ; )

    ; (defun force-withdraw-prize (account:string)
    ;     (with-capability (ADMIN)
    ;         (with-default-read prizes account
    ;           {"balance": 0.0}
    ;           {"balance":= oldbalance }
    ;           (enforce (> oldbalance 0.0) "you already withdrawn your prize")
    ;           (install-capability (coin.TRANSFER WIZ_BANK account oldbalance))
    ;           (coin.transfer WIZ_BANK account oldbalance)
    ;           (write prizes account {"balance": 0.0})
    ;           (emit-event (WITHDRAW_PRIZE account oldbalance))
    ;
    ;           (with-default-read token-table WIZ_BANK
    ;             {"balance": 0.0}
    ;             {"balance":= wizbalance }
    ;             (update token-table WIZ_BANK {"balance": (- wizbalance oldbalance)})
    ;           )
    ;         )
    ;     )
    ; )

    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    ;;;;;; PVP ;;;;;;;;;
    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

    ;id = idweek_idnft
    (defun subscribe-pvp (id:string week:string idnft:string address:string spellSelected:object)
        @doc "Subscribe a wizard to pvp arena"
        (let (
                (pvp-open (get-value PVP_OPEN))
                (data-wiz (get-wizard-fields-for-id (str-to-int idnft)))
            )
            (enforce (= pvp-open "1") "Pvp week registrations are closed")
            (enforce (= (at "confirmBurn" data-wiz) false) "You can't subscribe a wizard in burning queue")
        )
        (with-default-read pvp-subscribers id
            {"idnft": ""}
            {"idnft":= idnft }
            (enforce (= (length idnft) 0) "Already subscribed to this pvp week")
        )
        (with-capability (OWNER address idnft)
            ;(install-capability (coin.TRANSFER address ADMIN_ADDRESS 1.0))
            ;(coin.transfer address ADMIN_ADDRESS 1.0)
            (insert pvp-subscribers id {
                "pvpweek": week,
                "idnft": idnft,
                "address": address,
                "spellSelected": spellSelected
            })
        )
    )

    (defun change-spell-pvp (id:string idnft:string address:string spellSelected:object)
        (with-capability (OWNER address idnft)
            (update pvp-subscribers id {
                "spellSelected": spellSelected
            })
        )
    )

    (defun get-pvp-subscription (id:string)
        @doc "Check if id is subscribed for pvp week"
        (read pvp-subscribers id)
    )

    (defun get-all-subscription-for-pvpweek (idweek:string)
        @doc "Get all subscribers for a pvp week"
        (select pvp-subscribers (where "pvpweek" (= idweek)))
    )

    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    ;;;;;; UPGRADE ;;;;;;;;;
    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

    (defun buy-upgrades (account:string idnft:string stat:string increase:integer m:module{wiza1-interface-v1})
        (enforce (= (format "{}" [m]) "free.wiza") "not allowed, security reason")

        (with-capability (OWNER account idnft)
            (let (
                    (current-stat (at stat (get-wizard-fields-for-id (str-to-int idnft))))
                    (new-level (calculate-new-level-mass idnft stat increase))
                )
                (enforce (<= new-level LEVEL_CAP) "Wizard's level cannot exceed the level cap")
                (let (
                        (array-levels-to (drop -1 (enumerate current-stat (+ current-stat increase))))
                    )
                    (let (
                            (wiza-cost (fold (+) 0 (map (calculate-wiza-cost-from stat) array-levels-to)))
                        )
                        (spend-wiza wiza-cost account m)
                        (cond
                            (
                                (= stat "hp")
                                (update stats idnft {
                                    "hp": (+ current-stat increase)
                                })
                            )
                            (
                                (= stat "defense")
                                (update stats idnft {
                                    "defense": (+ current-stat increase)
                                })
                            )
                            (
                                (= stat "attack")
                                (update stats idnft {
                                    "attack": (+ current-stat increase)
                                })
                            )
                            (
                                (= stat "damage")
                                (update stats idnft {
                                    "damage": (+ current-stat increase)
                                })
                            )
                        "")
                        (emit-event (BUY_UPGRADE idnft stat increase wiza-cost account))
                    )
                )
            )
        )
    )

    (defun calculate-wiza-cost-from (stat:string from:integer)
        (let (
                (max-value (at "value" (read upgrade-stat-values stat ['value])))
                (base-cost (at "value" (read upgrade-stat-values (+ stat "_base_cost") ['value])))
            )
            (if
                (= (- max-value from) max-value)
                (let (
                        (last-part (/ base-cost 100))
                        (diff (- max-value 1))
                    )
                    (round (- base-cost (* (* 100 (/ diff max-value)) last-part )) 2)
                )
                (let (
                        (last-part (/ base-cost 100))
                        (diff (- max-value from))
                    )
                    (round (- base-cost (* (* 100 (/ diff max-value)) last-part )) 2)
                )
            )
        )
    )

    (defun calculate-new-level-mass (idnft:string stat:string increase:integer)
        (let (
                (data (get-wizard-fields-for-id (str-to-int idnft)))
            )
            (let (
                    (hp (at "hp" data))
                    (def (at "defense" data))
                    (atk (at "attack" data))
                    (dmg (at "damage" data))
                )
                (cond
                    (
                        (= stat "hp")
                        (round (+ (+ (+ (+ hp increase) (* def 4.67)) (* atk 4.67)) (* dmg 2.67)))
                    )
                    (
                        (= stat "defense")
                        (round (+ (+ (+ hp (* (+ def increase) 4.67)) (* atk 4.67)) (* dmg 2.67)))
                    )
                    (
                        (= stat "attack")
                        (round (+ (+ (+ hp (* def 4.67)) (* (+ atk increase) 4.67)) (* dmg 2.67)))
                    )
                    (
                        (= stat "damage")
                        (round (+ (+ (+ hp (* def 4.67)) (* atk 4.67)) (* (+ dmg increase) 2.67)))
                    )
                "")
            )
        )
    )

    ; (defun buy-upgrade (account:string idnft:string stat:string m:module{wiza1-interface-v1})
    ;     (enforce (= (format "{}" [m]) "free.wiza") "not allowed, security reason")
    ;     (with-capability (OWNER account idnft)
    ;         (let (
    ;                 (current-stat (at stat (get-wizard-fields-for-id (str-to-int idnft))))
    ;                 (wiza-cost (calculate-wiza-cost idnft stat))
    ;                 (new-level (calculate-new-level idnft stat))
    ;             )
    ;             (enforce (<= new-level LEVEL_CAP) "Wizard's level cannot exceed the level cap")
    ;             (spend-wiza wiza-cost account m)
    ;             (cond
    ;                 (
    ;                     (= stat "hp")
    ;                     (update stats idnft {
    ;                         "hp": (+ current-stat 1)
    ;                     })
    ;                 )
    ;                 (
    ;                     (= stat "defense")
    ;                     (update stats idnft {
    ;                         "defense": (+ current-stat 1)
    ;                     })
    ;                 )
    ;                 (
    ;                     (= stat "attack")
    ;                     (update stats idnft {
    ;                         "attack": (+ current-stat 1)
    ;                     })
    ;                 )
    ;                 (
    ;                     (= stat "damage")
    ;                     (update stats idnft {
    ;                         "damage": (+ current-stat 1)
    ;                     })
    ;                 )
    ;             "")
    ;         )
    ;     )
    ; )


    ; (defun calculate-wiza-cost (idnft:string stat:string)
    ;     (let (
    ;             (data (get-wizard-fields-for-id (str-to-int idnft)))
    ;             (max-value (at "value" (read upgrade-stat-values stat ['value])))
    ;             (base-cost (at "value" (read upgrade-stat-values (+ stat "_base_cost") ['value])))
    ;         )
    ;         (if
    ;             (= (- max-value (at stat data)) max-value)
    ;             (let (
    ;                     (last-part (/ base-cost 100))
    ;                     (diff (- max-value 1))
    ;                 )
    ;                 (round (- base-cost (* (* 100 (/ diff max-value)) last-part )) 2)
    ;             )
    ;             (let (
    ;                     (last-part (/ base-cost 100))
    ;                     (diff (- max-value (at stat data)))
    ;                 )
    ;                 (round (- base-cost (* (* 100 (/ diff max-value)) last-part )) 2)
    ;             )
    ;         )
    ;     )
    ; )

    ; (defun calculate-level (idnft:string)
    ;     (let (
    ;             (data (get-wizard-fields-for-id (str-to-int idnft)))
    ;         )
    ;         (let (
    ;                 (hp (at "hp" data))
    ;                 (def (at "defense" data))
    ;                 (atk (at "attack" data))
    ;                 (dmg (at "damage" data))
    ;             )
    ;             (round(+ (+ (+ hp (* def 4.67)) (* atk 4.67)) (* dmg 2.67)))
    ;         )
    ;     )
    ; )

    ; (defun calculate-new-level (idnft:string stat:string)
    ;     (let (
    ;             (data (get-wizard-fields-for-id (str-to-int idnft)))
    ;         )
    ;         (let (
    ;                 (hp (at "hp" data))
    ;                 (def (at "defense" data))
    ;                 (atk (at "attack" data))
    ;                 (dmg (at "damage" data))
    ;             )
    ;             (cond
    ;                 (
    ;                     (= stat "hp")
    ;                     (round (+ (+ (+ (+ hp 1) (* def 4.67)) (* atk 4.67)) (* dmg 2.67)))
    ;                 )
    ;                 (
    ;                     (= stat "defense")
    ;                     (round (+ (+ (+ hp (* (+ def 1) 4.67)) (* atk 4.67)) (* dmg 2.67)))
    ;                 )
    ;                 (
    ;                     (= stat "attack")
    ;                     (round (+ (+ (+ hp (* def 4.67)) (* (+ atk 1) 4.67)) (* dmg 2.67)))
    ;                 )
    ;                 (
    ;                     (= stat "damage")
    ;                     (round (+ (+ (+ hp (* def 4.67)) (* atk 4.67)) (* (+ dmg 1) 2.67)))
    ;                 )
    ;             "")
    ;         )
    ;     )
    ; )

    (defun spend-wiza (amount:decimal account:string m:module{wiza1-interface-v1})
        (enforce (= (format "{}" [m]) "free.wiza") "not allowed, security reason")
        (m::spend-wiza amount account)
    )

    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    ;;;;;; BURN ;;;;;;;;;
    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

    (defun add-to-burning-queue (idnft:string account:string m:module{wiza1-interface-v1})
        (enforce (= (format "{}" [m]) "free.wiza") "not allowed, security reason")
        (let (
                (data (get-wizard-fields-for-id (str-to-int idnft)))
                (is-staked (check-is-staked idnft m))
            )
            (enforce (= (at "listed" data) false) "You can't burn a listed wizard")
            (enforce (= is-staked false) "You can't burn a staked wizard")
        )
        (with-capability (OWNER account idnft)
            (write burning-queue-table idnft {
                "burned":false,
                "confirmBurn":true,
                "idnft":idnft,
                "account":account,
                "timestamp": (at "block-time" (chain-data))
            })
        )
    )

    (defun remove-from-burning-queue (idnft:string account:string)
        (with-capability (OWNER account idnft)
            (update burning-queue-table idnft {
                "confirmBurn":false
            })
        )
    )

    (defun burn-nft (idnft:string)
        (with-capability (ADMIN)
            (update burning-queue-table idnft {
                "burned":true,
                "confirmBurn":true,
                "account": WIZ_BANK
            })
            (update nfts idnft {
              "owner": WIZ_BANK
            })
            (update nfts-market idnft {
              "price": 0.0,
              "listed": false
            })
            (emit-event (BURN_NFT idnft))
        )
    )

    (defun get-burning-queue ()
        (select burning-queue-table (and?
            (where 'burned (= false))
            (where 'confirmBurn (= true))
        ))
    )

    (defun get-nft-in-burning-queue (idnft:string)
        (read burning-queue-table idnft)
    )

    (defun check-nft-in-burning-queue (idnft:string)
        (with-default-read burning-queue-table idnft
            {"confirmBurn":false}
            {"confirmBurn":=confirmBurn}
            confirmBurn
        )
    )

    (defun check-is-staked (idnft:string m:module{wiza1-interface-v1})
        (enforce (= (format "{}" [m]) "free.wiza") "not allowed, security reason")
        (m::check-nft-is-staked idnft)
    )

    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    ;;;;;; GENERIC FUN ;;;;;;;;;
    ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

    ; ; free wizard from admin to user
    ; (defun transfer:string
    ;     ( id:string
    ;       sender:string
    ;       receiver:string
    ;       amount:decimal
    ;     )
    ;     @doc " Transfer to an account, failing if the account to account does not exist. "
    ;     (enforce (= 1.0 amount) "Only 1 wizard can be transferred")
    ;     (enforce (= sender ADMIN_ADDRESS) "Can only send from admin account for now")
    ;     (with-capability (ADMIN)
    ;         (with-capability (OWNER sender id)
    ;             (update nfts id {"owner": receiver})
    ;         )
    ;     )
    ; )

    (defun transfer-wizard (id:string sender:string receiver:string m:module{wiza1-interface-v1})
        @doc "Transfer nft to an account"
        (enforce-account-exists receiver)
        (enforce (= (format "{}" [m]) "free.wiza") "not allowed, security reason")
        (with-capability (OWNER sender id)
            (let (
                    (data (get-wizard-fields-for-id (str-to-int id)))
                    (is-staked (check-is-staked id m))
                )
                (enforce (= (at "listed" data) false) "A listed wizard cannot be transferred")
                (enforce (= is-staked false) "You can't transfer a staked wizard")
                (enforce (= (at "confirmBurn" data) false) "You can't transfer a wizard in burning queue")
            )
            (update nfts id {"owner": receiver})
        )
    )

    (defun increase-count(key:string)
        @doc "Increases count of a key in a table by 1"
        (require-capability (PRIVATE))
        (update counts key
            {"count": (+ 1 (get-count key))}
        )
    )

    ; (defun reset-count(key:string)
    ;     @doc "Reset count of a key"
    ;     (with-capability (ADMIN)
    ;         (update counts key
    ;             {"count": 0}
    ;         )
    ;     )
    ; )

    (defun set-value(key:string value:string)
        @doc "Sets the value for a key to store in a table"
        (with-capability (ADMIN)
            (update values key
                {"value": value}
            )
        )
    )

    (defun write-new-value(key:string value:string)
        (with-capability (ADMIN)
            (write values key
                {"value": value}
            )
        )
    )

    (defun set-value-tournament(key:string value:decimal)
        @doc "Set values for tournament"
        (with-capability (ADMIN)
            (update values-tournament key {"value": value})
        )
    )

    ;;;;;; NON STATE MODIFYING HELPER FUNCTIONS ;;;;;;;;;

    (defun get-value-tournament(key:string)
        (at "value" (read values-tournament key ['value]))
    )

    (defun get-count (key:string)
        @doc "Gets count for key"
        (at "count" (read counts key ['count]))
    )

    (defun get-value (key:string)
        @doc "Gets value for a key"
        (at "value" (read values key ['value]))
    )

    ; (defun get-max-items()
    ;     (at "max" (read max-items MAX_ITEMS_PER_OWNER ["max"]))
    ; )

    (defun get-latest-wizard-data (id:string)
        (require-capability (PRIVATE))
        (let (
                (minted-count (get-count MINTED_COUNT_KEY))
                (created-count (get-count NFTS_COUNT_KEY))
            )
            (enforce (< 0 created-count) "no wizard created")
            (enforce (< minted-count created-count) "all wizard minted")
            (let (
                    (data (read creation id ['traits 'name 'imageHash]))
                )
                data
            )
        )
    )

    (defun id-for-new-wizard ()
        @doc "Returns an id for a new wizard to be minted"
        (int-to-str 10 (get-count MINTED_POST_COUNT_KEY))
    )

    ; (defun read-account-minted (address:string)
    ;     (at "minted" (read account-minted address ['minted]))
    ; )

    (defun wizard-owned-by (owner:string)
        @doc "all ids wizard from owner"
        (select nfts ['id] (where "owner" (= owner)))
    )

    (defun get-wizard-fields-for-ids (ids:list)
        @doc "Return fields for a list of ids"
        (map
            (get-wizard-fields-for-id)
            ids
        )
    )

    (defun get-wizard-fields-for-id:object (id:integer)
        @doc "Return the fields for a given id"
        (let (
                (info-market (read nfts-market (int-to-str 10 id)))
                (info-stat (read stats (int-to-str 10 id)))
                (confirmBurn (check-nft-in-burning-queue (int-to-str 10 id)))
                (max-reveal (str-to-int (get-value ID_REVEAL)))
            )
            ; per fare il reveal vediamo quale id ha la richeista, se è più di 1023 allora è un cleric
            (if
                (< id max-reveal)
                (let (
                        (info (read nfts (int-to-str 10 id)))
                    )
                    (+ (+ (+ info info-market) info-stat) {"confirmBurn":confirmBurn})
                )
                (let (
                        (info (read nfts (int-to-str 10 id) ['created 'owner 'name 'id 'imageHash]))
                    )
                    (+ (+ info info-market) {"confirmBurn":confirmBurn})
                )
            )
        )
    )

    (defun all-wizards ()
        @doc "Returns all the ids"
        (keys nfts)
    )

    (defun get-volume ()
        @doc "get volume of purchase"
        (at "count" (read volume VOLUME_PURCHASE_COUNT ['count]))
    )

    (defun get-all-on-sale ()
        @doc "get wizards on sale"
        (select nfts-market (where "listed" (= true)))
    )

    (defun get-prize ()
        (at "balance" (read token-table WIZ_BANK ['balance]))
    )

    (defun get-mint-price()
        (at "price" (read price PRICE_KEY ["price"]))
    )

    ;;;;;; GENERIC HELPER FUNCTIONS ;;;;;;;;;;

    (defun curr-chain-id ()
        @doc "Current chain id"
        (at "chain-id" (chain-data))
    )
)


(if (read-msg "upgrade")
  ["upgrade"]
  [
    (create-table nfts)
    (create-table nfts-market)
    (create-table creation)
    ;(create-table account-minted)
    (create-table counts)
    (create-table values)
    (create-table volume)
    ;(create-table max-items)
    (create-table token-table)
    (create-table tournaments)
    (create-table values-tournament)
    (create-table prizes)

    (create-table coin.coin-table)

    (create-table stats)
    (create-table upgrade-stat-values)
    (create-table burning-queue-table)

    (create-table free-mint-table)
    (create-table wl-mint-table)
    (create-table account-free-minted-clerics)
    (create-table account-minted-clerics)
    (create-table price)

    (create-table pvp-subscribers)
    (create-table offers-table)

    (initialize)
    (insertValuesUpgrade)
  ]
)
