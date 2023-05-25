package endpoints

import (
	"PollApp/src/PollApplication/domain"
	"PollApp/src/PollApplication/service"
	"context"

	"github.com/go-kit/kit/endpoint"
)

type GetAllPollsRequest struct {
	UserId int `json:"userId"`
}

type GetAllPollsResponse struct {
	Polls []domain.Poll `json:"polls"`
	Err   string        `json:"err,omitempty"`
}

type CreatePollRequest struct {
	Poll        domain.Poll `json:"poll"`
	PollOptions []string    `json:"pollOptions"`
	UserId      int         `json:"userId"`
}

type CreatePollResponse struct {
	Message string `json:"message"`
	Err     string `json:"err,omitempty"`
}

type GetPollRequest struct {
	PollId int `json:"pollId"`
}

type GetPollResponse struct {
	Poll domain.Poll `json:"poll"`
	Err  string      `json:"err,omitempty"`
}

type GetPollOptionsRequest struct {
	PollId int `json:"pollId"`
}

type GetPollOptionsResponse struct {
	PollOptions []domain.PollOption `json:"pollOptions"`
	Err         string              `json:"err,omitempty"`
}

type CreateVoteRequest struct {
	UserId       int `json:"userId"`
	PollId       int `json:"pollId"`
	PollOptionId int `json:"pollOptionId"`
}

type CreateVoteResponse struct {
	Message string `json:"message"`
	Err     string `json:"err,omitempty"`
}

type GetPollVotesRequest struct {
	PollId int `json:"pollId"`
}

type GetPollVotesResponse struct {
	PollVotes []domain.Vote `json:"pollVotes"`
	Err       string        `json:"err,omitempty"`
}

type UpdatePollRequest struct {
	PollId int  `json:"pollId"`
	UserId int  `json:"userId"`
	Status bool `json:"status"`
}

type UpdatePollResponse struct {
	Err string `json:"err,omitempty"`
}

func MakeGetAllPollsEndpoint(svc service.PollService) endpoint.Endpoint {
	return func(_ context.Context, request interface{}) (interface{}, error) {
		req := request.(GetAllPollsRequest)
		if req.UserId == 0 {
			polls, err := svc.GetAllPolls()
			if err != nil {
				return nil, err
			}
			return GetAllPollsResponse{Polls: polls, Err: ""}, nil
		} else {
			polls, err := svc.GetAllPollsByUser(req.UserId)
			if err != nil {
				return nil, err
			}
			return GetAllPollsResponse{Polls: polls, Err: ""}, nil
		}
	}
}

func MakeCreatePollEndpoint(svc service.PollService) endpoint.Endpoint {
	return func(_ context.Context, request interface{}) (interface{}, error) {
		req := request.(CreatePollRequest)
		err := svc.CreatePoll(req.Poll, req.PollOptions, req.UserId)
		if err != nil {
			return nil, err
		}
		return CreatePollResponse{Err: "", Message: "Poll was created successfully"}, nil
	}
}

func MakeGetPollEndpoint(svc service.PollService) endpoint.Endpoint {
	return func(_ context.Context, request interface{}) (interface{}, error) {
		req := request.(GetPollRequest)
		poll, err := svc.GetPoll(req.PollId)
		if err != nil {
			return nil, err
		}
		return GetPollResponse{Poll: *poll, Err: ""}, nil
	}
}

func MakeGetPollOptionsEndpoint(svc service.PollService) endpoint.Endpoint {
	return func(_ context.Context, request interface{}) (interface{}, error) {
		req := request.(GetPollOptionsRequest)
		pollOptions, err := svc.GetPollOptions(req.PollId)
		if err != nil {
			return nil, err
		}
		return GetPollOptionsResponse{PollOptions: pollOptions, Err: ""}, nil
	}
}

func MakeCreateVoteEndpoint(svc service.PollService) endpoint.Endpoint {
	return func(_ context.Context, request interface{}) (interface{}, error) {
		req := request.(CreateVoteRequest)
		err, msg := svc.CreateVote(req.PollOptionId, req.UserId, req.PollId)
		if err != nil {
			return nil, err
		}
		return CreateVoteResponse{Err: "", Message: msg}, nil
	}
}

func MakeGetPollVotesEndpoint(svc service.PollService) endpoint.Endpoint {
	return func(_ context.Context, request interface{}) (interface{}, error) {
		req := request.(GetPollVotesRequest)
		pollVotes, err := svc.GetPollVotes(req.PollId)
		if err != nil {
			return nil, err
		}
		return GetPollVotesResponse{PollVotes: pollVotes, Err: ""}, nil
	}
}

func MakeUpdatePollEndpoint(svc service.PollService) endpoint.Endpoint {
	return func(_ context.Context, request interface{}) (interface{}, error) {
		req := request.(UpdatePollRequest)
		err := svc.UpdatePoll(req.PollId, req.UserId, req.Status)
		if err != nil {
			return nil, err
		}
		return UpdatePollResponse{Err: ""}, nil
	}
}
