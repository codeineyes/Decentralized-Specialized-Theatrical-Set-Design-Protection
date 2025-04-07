;; Production Verification Contract
;; Documents use of designs in specific performances

(define-data-var last-production-id uint u0)

(define-map productions
  { production-id: uint }
  {
    producer: principal,
    design-id: uint,
    production-name: (string-utf8 100),
    venue: (string-utf8 100),
    start-date: uint,
    end-date: uint
  }
)

(define-public (register-production
    (design-id uint)
    (production-name (string-utf8 100))
    (venue (string-utf8 100))
    (start-date uint)
    (end-date uint))
  (let
    (
      (new-id (+ (var-get last-production-id) u1))
      (tx-sender tx-sender)
    )
    ;; Ensure end date is after start date
    (asserts! (>= end-date start-date) (err u1))

    (map-set productions
      { production-id: new-id }
      {
        producer: tx-sender,
        design-id: design-id,
        production-name: production-name,
        venue: venue,
        start-date: start-date,
        end-date: end-date
      }
    )

    (var-set last-production-id new-id)
    (ok new-id)
  )
)

(define-read-only (get-production (production-id uint))
  (map-get? productions { production-id: production-id })
)

(define-read-only (get-production-count)
  (var-get last-production-id)
)
