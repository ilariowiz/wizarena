(namespace "free")
(define-keyset "free.wiza-token-keyset" (read-keyset "wiza-token-keyset"))

(module wiza ADMIN
    @doc "WIZA token"
    @model
    [ (defproperty conserves-mass (amount:decimal)
        (= (column-delta token-table 'balance) 0.0))
      (defproperty valid-account-id (accountId:string)
        (and
          (>= (length accountId) 3)
          (<= (length accountId) 256))) ]

    (use coin)
  (implements fungible-v2)
  (implements wiza1-interface-v4)

  ; --------------------------------------------------------------------------
 ; Constants
; --------------------------------------------------------------------------

    (defconst ADMIN_KEYSET "free.wiza-token-keyset")
    (defconst ADMIN_ADDRESS "k:90f45921e0605560ace17ca8fbbe72df95ba7034abeec7a8a7154e9eda7114eb")

    (defconst TOKEN_NAME "WIZA"
        "the name of the token")

    (defconst DECIMALS 12
        "Specifies the minimum denomination for token transactions.")

    (defconst ACCOUNT_ID_CHARSET CHARSET_LATIN1
        "Allowed character set for account IDs.")

    (defconst ACCOUNT_ID_MIN_LENGTH 3
        "Minimum character length for account IDs.")

    (defconst ACCOUNT_ID_MAX_LENGTH 256
        "Maximum character length for account IDs.")

    (defconst STARTING_SUPPLY:decimal 0.0
        "WIZA starting supply")

    (defconst MAXIMUM_SUPPLY:decimal 13240000.0
        "WIZA maximum supply")

    (defconst WIZA_TOKEN_BANK:string "wiza-token-bank")

  ; --------------------------------------------------------------------------
  ; Schemas and tables
  ; --------------------------------------------------------------------------

    (defschema token-schema
        balance:decimal
        guard:guard
    )

    (defschema mined-wiza-schema
        amount:decimal
    )

    (deftable token-table:{token-schema})
    (deftable mined-wiza-table:{mined-wiza-schema})

    ; --------------------------------------------------------------------------
 ; Capatilibites
 ; --------------------------------------------------------------------------

    (defcap PRIVATE ()
        @doc "can only be called from a private context"
        true
    )

    (defcap ADMIN() ; Used for admin functions
        @doc "Only allows admin to call these"
        (enforce-keyset ADMIN_KEYSET)
        (compose-capability (PRIVATE))
        (compose-capability (ACCOUNT_GUARD ADMIN_ADDRESS))
    )

    (defcap ACCOUNT_GUARD(account:string)
        @doc "Verifies account meets format and belongs to caller"
        (enforce (is-principal account) "")
        (enforce-guard (at "guard" (coin.details account)))
    )

    ;; checks the owner of the nft
    (defcap OWNER (account:string id:string owner:string)
        @doc "Enforces that an account owns the nft"
        (enforce (= owner account) "Account is not owner of the NFT")
        (compose-capability (ACCOUNT_GUARD account))
    )

    (defcap DEBIT ( sender:string )
        @doc " Capability to perform debiting operations. "
        (enforce-guard (at 'guard (read token-table sender ['guard ])))
        (enforce (!= sender "") "Invalid sender.")
    )

    (defcap CREDIT ( receiver:string )
        @doc " Capability to perform crediting operations. "
        (enforce (!= receiver "") "Invalid receiver.")
    )

    (defcap TRANSFER:bool
        ( sender:string
            receiver:string
            amount:decimal )
        @doc " Capability to move tokens from an accounts. "
        @managed amount TRANSFER-mgr
        (enforce (!= sender receiver) "same sender and receiver")
        (enforce-unit amount)
        (enforce (> amount 0.0) "Positive amount")
        (compose-capability (DEBIT sender))
        (compose-capability (CREDIT receiver))
    )

    (defun TRANSFER-mgr:decimal
        ( managed:decimal
          requested:decimal )
        @doc " Manages transfer operations. "
        (let ((newbal (- managed requested)))
        (enforce (>= newbal 0.0)
        (format "TRANSFER exceeded for balance {}" [managed])) newbal)
    )

    (defun create-BANK-guard ()
        (create-user-guard (require-PRIVATE))
    )

    (defun require-PRIVATE ()
        (require-capability (PRIVATE))
    )

    (defcap SPEND_WIZA (account:string amount:decimal)
        @event true
    )

; --------------------------------------------------------------------------
  ; Initialize
  ; --------------------------------------------------------------------------
  (defun initialize ()

    (coin.create-account WIZA_TOKEN_BANK (create-BANK-guard))
    (create-account WIZA_TOKEN_BANK (create-BANK-guard))

    (write mined-wiza-table "" {"amount":0.0})
  )

    ; --------------------------------------------------------------------------
 ; Utilities
 ; --------------------------------------------------------------------------
 (defun validate-account-id ( accountId:string )
 @doc " Enforce that an account ID meets charset and length requirements. "
 (enforce
   (is-charset ACCOUNT_ID_CHARSET accountId)
   (format
     "Account ID does not conform to the required charset: {}"
     [accountId]))
 (let ((accountLength (length accountId)))
   (enforce
     (>= accountLength ACCOUNT_ID_MIN_LENGTH)
     (format
       "Account ID does not conform to the min length requirement: {}"
       [accountId]))
   (enforce
     (<= accountLength ACCOUNT_ID_MAX_LENGTH)
     (format
       "Account ID does not conform to the max length requirement: {}"
       [accountId]))))

     (defun transfer-create:string
     ( sender:string
       receiver:string
       receiver-guard:guard
       amount:decimal )
     @doc " Transfer to an account, creating it if it does not exist. "
     @model [ (property (conserves-mass amount))
              (property (> amount 0.0))
              (property (valid-account-id sender))
              (property (valid-account-id receiver))
              (property (!= sender receiver)) ]
     (with-capability (TRANSFER sender receiver amount)
       (debit sender amount)
       (credit receiver receiver-guard amount)))

    (defun transfer:string
     ( sender:string
       receiver:string
       amount:decimal )
     @doc " Transfer to an account, failing if the account does not exist. "
     @model [ (property (conserves-mass amount))
              (property (> amount 0.0))
              (property (valid-account-id sender))
              (property (valid-account-id receiver))
              (property (!= sender receiver)) ]
     (with-read token-table receiver
       { "guard" := guard }
       (transfer-create sender receiver guard amount)))

     (defun debit
     ( accountId:string
       amount:decimal )
     @doc " Decrease an account balance. Internal use only. "
     @model [ (property (> amount 0.0))
              (property (valid-account-id accountId)) ]
     (validate-account-id accountId)
     (enforce (> amount 0.0) "Debit amount must be positive.")
     (enforce-unit amount)
     (if (= accountId WIZA_TOKEN_BANK) (require-capability (PRIVATE)) true)
     (require-capability (DEBIT accountId))
     (with-read token-table accountId
       { "balance" := balance }
       (enforce (<= amount balance) "Insufficient funds.")
       (update token-table accountId
         { "balance" : (- balance amount) })))

    (defun credit
     ( accountId:string
       guard:guard
       amount:decimal )
     @doc " Increase an account balance. Internal use only. "
     @model [ (property (> amount 0.0))
              (property (valid-account-id accountId)) ]
     (validate-account-id accountId)
     (enforce (> amount 0.0) "Credit amount must be positive.")
     (enforce-unit amount)
     (require-capability (CREDIT accountId))
     (with-default-read token-table accountId
       { "balance" : -1.0, "guard" : guard }
       { "balance" := balance, "guard" := retg }
       ; we don't want to overwrite an existing guard with the user-supplied one
       (enforce (= retg guard)
         "account guards do not match")
       (let ((is-new
              (if (= balance -1.0)
                  (enforce-reserved accountId guard)
                false)))
         (write token-table accountId
           { "balance" : (if is-new amount (+ balance amount))
           , "guard"   : retg }))))

     (defun get-balance:decimal ( account:string )
     (at 'balance (read token-table account ['balance])))

    (defun details:object{fungible-v2.account-details} ( account:string )
     (with-read token-table account
       { "balance" := balance
       , "guard"   := guard }
       { "account" : account
       , "balance" : balance
       , "guard"   : guard } ))

    (defun precision:integer ()
     DECIMALS)

    (defun enforce-unit:bool ( amount:decimal )
     @doc " Enforce the minimum denomination for token transactions. "
     (enforce
       (= (floor amount DECIMALS) amount)
       (format "Amount violates minimum denomination: {}" [amount])))

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

          (defschema crosschain-schema
          @doc " Schema for yielded value in cross-chain transfers "
          receiver:string
          receiver-guard:guard
          amount:decimal )

        (defpact transfer-crosschain:string
          ( sender:string
            receiver:string
            receiver-guard:guard
            target-chain:string
            amount:decimal )
          @model [ (property (> amount 0.0))
                   (property (!= receiver ""))
                   (property (valid-account-id sender))
                   (property (valid-account-id receiver)) ]
          (step
            (with-capability (DEBIT sender)
              (validate-account-id sender)
              (validate-account-id receiver)
              (enforce (!= "" target-chain) "empty target-chain")
              (enforce (!= (at 'chain-id (chain-data)) target-chain)
                "cannot run cross-chain transfers to the same chain")
              (enforce (> amount 0.0)
                "transfer quantity must be positive")
              (enforce-unit amount)
              ;; Step 1 - debit sender account on current chain
              (debit sender amount)
              (let
                ((
                  crosschain-details:object{crosschain-schema}
                  { "receiver"       : receiver
                  , "receiver-guard" : receiver-guard
                  , "amount"         : amount
                  }
                ))
                (yield crosschain-details target-chain))))
          (step
            (resume
              { "receiver"       := receiver
              , "receiver-guard" := receiver-guard
              , "amount"         := amount
              }
              ;; Step 2 - credit receiver account on target chain
              (with-capability (CREDIT receiver)
                (credit receiver receiver-guard amount)
              ))))


    (defun rotate:string
    ( account:string
      new-guard:guard )
    (if (= account WIZA_TOKEN_BANK) (require-capability (PRIVATE)) true)
    (with-read token-table account
      { "guard" := oldGuard }
      (enforce-guard oldGuard)
      (enforce-guard new-guard)
      (update token-table account
        { "guard" : new-guard } )))

  ; --------------------------------------------------------------------------
    ; WIZA functions
    ; --------------------------------------------------------------------------

    (defun spend-wiza:bool (amount:decimal account:string)
        (enforce (= (at "chain-id" (chain-data)) "1") "Spend is only for chain 1")
        (let (
                (balance (get-user-balance account))
            )
            (enforce (<= amount balance) "You don't have enough WIZA")
        )
        (with-capability (TRANSFER account WIZA_TOKEN_BANK amount)
            (with-default-read token-table account
              {"balance": 0.0}
              {"balance":= oldbalance}
              (update token-table account {
                  "balance": (- oldbalance amount)})
            )
            (with-default-read token-table WIZA_TOKEN_BANK
              {"balance": 0.0}
              {"balance":= oldbalance}
              (update token-table WIZA_TOKEN_BANK {
                  "balance": (+ oldbalance amount)})
            )
            (emit-event (SPEND_WIZA account amount))
        )
    )

    (defun get-wiza-from-bank-bulk (accounts:list)
        (with-capability (ADMIN)
            (map
                (get-wiza-from-bank)
                accounts
            )
        )
    )

    (defun get-wiza-from-bank (reward-data:object)
        (require-capability (ADMIN))
        (let (
                (account (at "account" reward-data))
                (amount (at "amount" reward-data))
            )
            (with-default-read token-table account
              {"balance": 0.0}
              {"balance":= oldbalance}
              (update token-table account {
                  "balance": (+ oldbalance amount)})
            )
            (with-default-read token-table WIZA_TOKEN_BANK
              {"balance": 0.0}
              {"balance":= oldbalance}
              (update token-table WIZA_TOKEN_BANK {
                  "balance": (- oldbalance amount)})
            )
        )
    )

    ; --------------------------------------------------------------------------
    ; helpers functions
    ; --------------------------------------------------------------------------
    (defun get-wizard-data (id:string m:module{wizarena-interface-v2})
        (enforce (= (at "chain-id" (chain-data)) "1") "Wizard data is only for chain 1")
        (enforce (= (format "{}" [m]) "free.wiz-arena") "not allowed, security reason")
        (m::get-wizard-fields-for-id (str-to-int id))
    )

    (defun get-total-mined ()
        @doc "get total WIZA mined"
        (at "amount" (read mined-wiza-table "" ['amount]))
    )

    (defun get-circulating-supply ()
        @doc "get total mined - wiza in bank"
        (- (get-total-mined) (get-balance WIZA_TOKEN_BANK))
    )

    (defun get-user-balance (address:string)
        (with-default-read token-table address
            {"balance": 0.0}
            {"balance":= balance}
            balance
        )
    )
)


(if (read-msg "upgrade")
  ["upgrade"]
  [
    (create-table token-table)
    (create-table mined-wiza-table)

    (initialize)

  ]
)
