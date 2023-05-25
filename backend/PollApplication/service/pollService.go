package service

import (
	"PollApp/src/PollApplication/domain"
)

type PollService interface {
	GetAllPolls() ([]domain.Poll, error)
	GetAllPollsByUser(int) ([]domain.Poll, error)
	CreatePoll(domain.Poll, []string, int) error
	GetPoll(int) (*domain.Poll, error)
	GetPollOptions(int) ([]domain.PollOption, error)
	CreateVote(int, int, int) (error, string)
	GetPollVotes(int) ([]domain.Vote, error)
	UpdatePoll(int, int, bool) error
	// CreatePollOptions(int, []string) error
	// UpdatePollStatus(int) (domain.Poll, error)
	// CreatePollOptions([]domain.PollOption, int) ([]domain.PollOption, error)
	// CreateVote(int, int) error
	// GetAllVotes(int) ([]domain.PollVote, error)
	// CreateUser(domain.User) (domain.User, error)
}

type defaultPollService struct {
	repo domain.PollRepository
}

func (ps defaultPollService) GetAllPolls() ([]domain.Poll, error) {
	return ps.repo.GetAllPolls()
}

func (ps defaultPollService) GetAllPollsByUser(userId int) ([]domain.Poll, error) {
	return ps.repo.GetAllPollsByUser(userId)
}

func (ps defaultPollService) CreatePoll(poll domain.Poll, pollOptions []string, userId int) error {
	return ps.repo.CreatePoll(poll, pollOptions, userId)
}

func (ps defaultPollService) GetPoll(pollId int) (*domain.Poll, error) {
	return ps.repo.GetPoll(pollId)
}

func (ps defaultPollService) GetPollOptions(pollId int) ([]domain.PollOption, error) {
	return ps.repo.GetPollOptions(pollId)
}

func (ps defaultPollService) CreateVote(pollOptionId int, userId int, pollId int) (error, string) {
	return ps.repo.CreateVote(pollOptionId, userId, pollId)
}

func (ps defaultPollService) GetPollVotes(pollOptionId int) ([]domain.Vote, error) {
	return ps.repo.GetPollVotes(pollOptionId)
}

func (ps defaultPollService) UpdatePoll(pollId int, userId int, pollStatus bool) error {
	return ps.repo.UpdatePoll(pollId, userId, pollStatus)
}

// func (ps defaultPollService) CreatePollOptions(pollId int, pollOptions []string) error {
// 	return ps.repo.CreatePollOptions(pollId, pollOptions)
// }

// func (ps defaultPollService) UpdatePollStatus(pollId int) (domain.Poll, error) {
// 	return ps.repo.UpdatePollStatus(pollId)
// }

// func (ps defaultPollService) CreatePollOptions(pollOptions []domain.PollOption, pollId int) ([]domain.PollOption, error) {
// 	return ps.repo.CreatePollOptions(pollOptions, pollId)
// }

// func (ps defaultPollService) CreateVote(pollId int, userId int) error {
// 	return ps.repo.CreateVote(pollId, userId)
// }

// func (ps defaultPollService) GetAllVotes(pollId int) ([]domain.PollVote, error) {
// 	return ps.repo.GetAllVotes(pollId)
// }

// func (ps defaultPollService) CreateUser(user domain.User) (domain.User, error) {
// 	return ps.repo.CreateUser(user)
// }

func NewDefaultPollService(repo domain.PollRepository) defaultPollService {
	return defaultPollService{repo: repo}
}
