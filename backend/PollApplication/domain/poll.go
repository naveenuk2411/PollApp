package domain

import (
	"time"
)

type Poll struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      bool      `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	EndedAt     time.Time `json:"endedAt"`
}

type PollOption struct {
	ID   int    `json:"id"`
	Text string `json:"text"`
}

type Vote struct {
	ID     int        `json:"id"`
	User   User       `json:"user"`
	Option PollOption `json:"option"`
}

type PollRepository interface {
	GetAllPolls() ([]Poll, error)
	GetAllPollsByUser(int) ([]Poll, error)
	CreatePoll(Poll, []string, int) error
	GetPoll(int) (*Poll, error)
	GetPollOptions(int) ([]PollOption, error)
	CreateVote(int, int, int) (error, string)
	GetPollVotes(int) ([]Vote, error)
	UpdatePoll(int, int, bool) error
}
