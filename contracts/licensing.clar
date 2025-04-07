;; Licensing Contract
;; Manages permissions for reproduction or adaptation

(define-data-var last-license-id uint u0)

(define-map licenses
  { license-id: uint }
  {
    design-id: uint,
    licensor: principal,
    licensee: principal,
    terms: (string-utf8 500),
    start-date: uint,
    end-date: uint,
    fee: uint,
    is-active: bool
  }
)

(define-map design-owners
  { design-id: uint }
  { owner: principal }
)

(define-public (register-design-owner (design-id uint))
  (let
    ((tx-sender tx-sender))
    ;; In a real implementation, this would verify ownership from the design-registration contract
    (map-set design-owners
      { design-id: design-id }
      { owner: tx-sender }
    )
    (ok true)
  )
)

(define-public (issue-license
    (design-id uint)
    (licensee principal)
    (terms (string-utf8 500))
    (start-date uint)
    (end-date uint)
    (fee uint))
  (let
    (
      (new-id (+ (var-get last-license-id) u1))
      (tx-sender tx-sender)
      (owner-data (map-get? design-owners { design-id: design-id }))
    )
    ;; Ensure sender is the design owner
    (asserts! (and (is-some owner-data) (is-eq tx-sender (get owner (unwrap-panic owner-data)))) (err u1))
    ;; Ensure end date is after start date
    (asserts! (>= end-date start-date) (err u2))

    (map-set licenses
      { license-id: new-id }
      {
        design-id: design-id,
        licensor: tx-sender,
        licensee: licensee,
        terms: terms,
        start-date: start-date,
        end-date: end-date,
        fee: fee,
        is-active: true
      }
    )

    (var-set last-license-id new-id)
    (ok new-id)
  )
)

(define-public (revoke-license (license-id uint))
  (let
    (
      (tx-sender tx-sender)
      (license-data (map-get? licenses { license-id: license-id }))
    )
    ;; Ensure license exists and sender is the licensor
    (asserts! (is-some license-data) (err u1))
    (asserts! (is-eq tx-sender (get licensor (unwrap-panic license-data))) (err u2))

    (map-set licenses
      { license-id: license-id }
      (merge (unwrap-panic license-data) { is-active: false })
    )

    (ok true)
  )
)

(define-read-only (get-license (license-id uint))
  (map-get? licenses { license-id: license-id })
)

(define-read-only (get-license-count)
  (var-get last-license-id)
)
