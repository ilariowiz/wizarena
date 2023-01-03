(namespace "free")
(define-keyset "free.wiza-token2-keyset" (read-keyset "wiza-token2-keyset"))

(module wiza2 ADMIN
    @doc "WIZA token"
    @model
    [ (defproperty conserves-mass (amount:decimal)
        (= (column-delta token-table 'balance) 0.0))
      (defproperty valid-account-id (accountId:string)
        (and
          (>= (length accountId) 3)
          (<= (length accountId) 256))) ]

  (implements wiza1-interface-v1)
  (implements wizarena-interface-v1)

  (defconst ADMIN_KEYSET "free.wiza-token2-keyset")

  (defcap PRIVATE ()
      @doc "can only be called from a private context"
      true
  )

  (defcap ADMIN() ; Used for admin functions
      @doc "Only allows admin to call these"
      (enforce-keyset ADMIN_KEYSET)
      (compose-capability (PRIVATE))
  )

  (defun spend-wiza:object (amount:decimal account:string)
    true
  )

  (defun check-nft-is-staked:object (idnft:string)
    true
  )

  (defun get-wizard-fields-for-id:object (id:integer)
    true
  )

 )
