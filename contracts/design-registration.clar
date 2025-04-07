;; Design Registration Contract
;; Records details of original stage designs

(define-data-var last-design-id uint u0)

(define-map designs
  { design-id: uint }
  {
    designer: principal,
    title: (string-utf8 100),
    description: (string-utf8 500),
    creation-date: uint,
    hash: (buff 32)  ;; Hash of design files/images
  }
)

(define-public (register-design
    (title (string-utf8 100))
    (description (string-utf8 500))
    (hash (buff 32)))
  (let
    (
      (new-id (+ (var-get last-design-id) u1))
      (tx-sender tx-sender)
    )
    (asserts! (is-eq (len hash) u32) (err u1)) ;; Ensure hash is correct length

    (map-set designs
      { design-id: new-id }
      {
        designer: tx-sender,
        title: title,
        description: description,
        creation-date: block-height,
        hash: hash
      }
    )

    (var-set last-design-id new-id)
    (ok new-id)
  )
)

(define-read-only (get-design (design-id uint))
  (map-get? designs { design-id: design-id })
)

(define-read-only (get-design-count)
  (var-get last-design-id)
)
