;; Attribution Tracking Contract
;; Monitors proper credit for designers

(define-data-var last-attribution-id uint u0)

(define-map attributions
  { attribution-id: uint }
  {
    design-id: uint,
    production-id: uint,
    designer: principal,
    credit-text: (string-utf8 200),
    verified: bool
  }
)

(define-public (register-attribution
    (design-id uint)
    (production-id uint)
    (designer principal)
    (credit-text (string-utf8 200)))
  (let
    (
      (new-id (+ (var-get last-attribution-id) u1))
      (tx-sender tx-sender)
    )

    (map-set attributions
      { attribution-id: new-id }
      {
        design-id: design-id,
        production-id: production-id,
        designer: designer,
        credit-text: credit-text,
        verified: false
      }
    )

    (var-set last-attribution-id new-id)
    (ok new-id)
  )
)

(define-public (verify-attribution (attribution-id uint))
  (let
    (
      (tx-sender tx-sender)
      (attribution-data (map-get? attributions { attribution-id: attribution-id }))
    )
    ;; Ensure attribution exists
    (asserts! (is-some attribution-data) (err u1))

    ;; In a real implementation, this would verify that the sender is authorized
    ;; to verify this attribution (e.g., the designer or a trusted authority)
    (asserts! (is-eq tx-sender (get designer (unwrap-panic attribution-data))) (err u2))

    (map-set attributions
      { attribution-id: attribution-id }
      (merge (unwrap-panic attribution-data) { verified: true })
    )

    (ok true)
  )
)

(define-read-only (get-attribution (attribution-id uint))
  (map-get? attributions { attribution-id: attribution-id })
)

(define-read-only (get-attribution-count)
  (var-get last-attribution-id)
)
