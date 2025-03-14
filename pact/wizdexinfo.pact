(namespace "free")
(define-keyset "free.wizdexinfo-keyset" (read-keyset "wizdexinfo-keyset"))

(module wiz-dexinfo ADMIN

    (defconst ADMIN_KEYSET "free.wizdexinfo-keyset")

    (defcap ADMIN() ; Used for admin functions
        @doc "Only allows admin to call these"
        (enforce-keyset ADMIN_KEYSET)
    )

    (defun get-wiza-value ()
        (let (
                (data (kdlaunch.kdswap-exchange.get-pair coin free.wiza))
            )
            (let (
                    (kdareserve (at "reserve" (at "leg0" data)))
                    (wizareserve (at "reserve" (at "leg1" data)))
                )
                (floor (/ wizareserve kdareserve) 4)
            )
        )
    )
)
