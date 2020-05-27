(define-data-var changed-line (buff 1000) "test change")
(define-data-var original-line (buff 1000) "test original")
(define-data-var votes int 0)
(define-constant needed-votes 3)
(define-data-var voting-allowed bool false)


;;++++++++++++++++
;;+    GETTERS   +
;;++++++++++++++++

;;all these functions should get a value for the public
;;most are simple getters
;;the exception being GetRemainingVotes, which returns the number of votes needed to approve a certain change
(define-public (GetChangeValue)
    (ok (var-get changed-line)))

(define-public (GetOriginalValue) 
    (ok (var-get original-line)))

(define-public (GetVotes) 
    (ok (var-get votes)))

;;Logic: If the number of votes is greater than or equal to the needed votes, then the remaining votes to approve is always zero
;;else it is just the needed votes minus the number of votes
(define-public (GetRemainingVotes) 
    (ok (if (>= (var-get votes) needed-votes) 0 (- needed-votes (var-get votes)))))

(define-public (GetVoteStatus) 
    (ok (var-get voting-allowed)))



;;++++++++++++++++
;;+    SETTERS   +
;;++++++++++++++++

;; These are the functions to set value of a variable and then return the new value

;;This function should return set the changed-line value and then return the new value
(define-public (SetChangeValue (incomingChange (buff 1000)))
    (begin 
        (var-set changed-line incomingChange)
        (ok (var-get changed-line))
    )
)

(define-public (SetOriginalValue (incomingValue (buff 1000)))
    (begin 
        (var-set original-line incomingValue)
        (ok (var-get original-line))
    )
)


;;++++++++++++++++++
;;+    Utilities   +
;;++++++++++++++++++



(define-public (InitializeNewVote (change (buff 1000)) (original (buff 1000)))
    (begin 
        (SetChangeValue change) 
        (SetOriginalValue original)
        (var-set votes 0)
        (ok 0)))


;; Allows voting to happen
(define-public (AllowVoting)
    (begin
    (var-set voting-allowed true)
     (ok (GetVoteStatus))))

;; Disallows Voting
(define-public (DisallowVoting) 
    (begin 
     (var-set voting-allowed false)
        (ok (GetVoteStatus))))


;; Allows a vote to be cast to approve a change
;; Only works when voting is allowed
(define-public (VoteToApprove)
    (begin
        (var-set votes (+ (var-get votes) (if (var-get voting-allowed) 1 0 )))
        (ok (var-get votes))))

(define-public (ResolveVoting) 
    (begin 
    (DisallowVoting)
    (ok (if (>= (var-get votes) needed-votes) true false))))

;; Stub for more later functionality
(define-public (VoteToReject)
    (ok 0))
