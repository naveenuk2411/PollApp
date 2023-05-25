package domain

import (
	"PollApp/src/PollApplication/customError"
	"database/sql"
	"errors"
	"fmt"
	"log"

	"github.com/lib/pq"
	_ "github.com/lib/pq"
)

type PollRepositoryDB struct {
	client *sql.DB
}

func (prdb PollRepositoryDB) GetAllPolls() ([]Poll, error) {
	findAllSql := "select id, title, description, created_at, updated_at, ended_at, status from poll"

	rows, err := prdb.client.Query(findAllSql)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, customError.ErrNotFound
		} else {
			log.Println("error while querying for polls table", err.Error())
			return nil, errors.New("unexpected database error")
		}
	}

	polls := make([]Poll, 0)
	for rows.Next() {
		var poll Poll
		err := rows.Scan(&poll.ID, &poll.Title, &poll.Description, &poll.CreatedAt, &poll.UpdatedAt, &poll.EndedAt, &poll.Status)
		if err != nil {
			log.Println("Error while scanning polls", err.Error())
			return nil, errors.New("unexpected database error")
		}
		polls = append(polls, poll)
	}
	return polls, nil
}

func (prdb PollRepositoryDB) GetAllPollsByUser(userId int) ([]Poll, error) {
	findAllSql := "select id, title, description, created_at, updated_at, ended_at, status from poll where user_id = $1"

	rows, err := prdb.client.Query(findAllSql, userId)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, customError.ErrNotFound
		} else {
			log.Println("error while querying for polls table", err.Error())
			return nil, errors.New("unexpected database error")
		}
	}

	polls := make([]Poll, 0)
	for rows.Next() {
		var poll Poll
		err := rows.Scan(&poll.ID, &poll.Title, &poll.Description, &poll.CreatedAt, &poll.UpdatedAt, &poll.EndedAt, &poll.Status)
		if err != nil {
			log.Println("Error while scanning polls", err.Error())
			return nil, errors.New("unexpected database error")
		}
		polls = append(polls, poll)
	}
	return polls, nil
}

func (prdb PollRepositoryDB) CreatePoll(poll Poll, pollOptions []string, userId int) error {
	createSql := `insert into poll(title, description, user_id, status) values($1, $2, $3, $4) RETURNING id`

	var pollId int
	err := prdb.client.QueryRow(createSql, poll.Title, poll.Description, userId, poll.Status).Scan(&pollId)
	fmt.Println(pollId, "Poll id creation when inserting a new poll")

	if err != nil {
		log.Println("Error while inserting into polls table", err.Error())
		return errors.New("unexpected database error")
	}

	txn, err := prdb.client.Begin()
	if err != nil {
		log.Println("Error while initiating a transaction for batch insert", err.Error())
		return errors.New("unexpected database error")
	}

	sqlBatchInsertStmt, err := txn.Prepare(pq.CopyIn("option", "text", "poll_id"))
	if err != nil {
		log.Println("Error while initiating a batch insert statement", err.Error())
		return errors.New("unexpected database error")
	}

	for _, option := range pollOptions {
		_, err = sqlBatchInsertStmt.Exec(option, pollId)
		if err != nil {
			log.Println("Error while initiating a batch insert statement", err.Error())
			return errors.New("unexpected database error")
		}
	}

	_, err = sqlBatchInsertStmt.Exec()
	if err != nil {
		log.Println("Error while executing a batch insert statement", err.Error())
		return errors.New("unexpected database error")
	}

	err = sqlBatchInsertStmt.Close()
	if err != nil {
		log.Println("Error while closing batch insert statement", err.Error())
		return errors.New("unexpected database error")
	}

	err = txn.Commit()
	if err != nil {
		log.Println("Error while committing batch insert transaction", err.Error())
		return errors.New("unexpected database error")
	}
	return nil
}

func (prdb PollRepositoryDB) GetPoll(pollId int) (*Poll, error) {
	findSql := `select id, title, description, created_at, updated_at, ended_at, status from poll where id = $1`

	rows, err := prdb.client.Query(findSql, pollId)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, customError.ErrNotFound
		} else {
			log.Println("error while querying for polls table for a given id", err.Error())
			return nil, errors.New("unexpected database error")
		}
	}

	polls := make([]Poll, 0)
	for rows.Next() {
		var poll Poll
		err := rows.Scan(&poll.ID, &poll.Title, &poll.Description, &poll.CreatedAt, &poll.UpdatedAt, &poll.EndedAt, &poll.Status)
		if err != nil {
			log.Println("Error while scanning polls for a given id", err.Error())
			return nil, errors.New("unexpected database error")
		}
		polls = append(polls, poll)
	}
	return &polls[0], nil

}

func (prdb PollRepositoryDB) GetPollOptions(pollId int) ([]PollOption, error) {
	findSql := `select id, text from option where poll_id = $1`

	rows, err := prdb.client.Query(findSql, pollId)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, customError.ErrNotFound
		} else {
			log.Println("error while querying for option table for a given poll id", err.Error())
			return nil, errors.New("unexpected database error")
		}
	}

	options := make([]PollOption, 0)
	for rows.Next() {
		var option PollOption
		err := rows.Scan(&option.ID, &option.Text)
		if err != nil {
			log.Println("Error while scanning options for a given poll id", err.Error())
			return nil, errors.New("unexpected database error")
		}
		options = append(options, option)
	}
	return options, nil
}

func (prdb PollRepositoryDB) CreateVote(pollOptionId int, userId int, pollId int) (error, string) {
	createSql := `insert into vote(user_id, option_id) values($1, $2)`
	countSql := `select count(*) from vote where user_id = $1 and option_id in (select id from option where poll_id = $2)`

	var countVotes int
	err := prdb.client.QueryRow(countSql, userId, pollId).Scan(&countVotes)

	if err != nil {
		log.Println("Error while checking for existing vote in vote table", err.Error())
		return errors.New("unexpected database error"), ""
	}

	if countVotes > 0 {
		log.Println("Vote has already been made by the user")
		return nil, "You have already made a vote"
	}

	_, QuerErr := prdb.client.Query(createSql, userId, pollOptionId)

	if QuerErr != nil {
		log.Println("Error while inserting into votes table", QuerErr.Error())
		return errors.New("unexpected database error"), ""
	}

	return nil, "Your vote has been recorded succesfully"
}

func (prdb PollRepositoryDB) GetPollVotes(pollId int) ([]Vote, error) {
	findSql := `select v.id, u.id, u.name, u.email, o.id, o.text  from vote as v join "User" as u on v.user_id = u.id join option as o on v.option_id = o.id where o.poll_id = $1`
	checkSql := `select status from poll where id = $1`

	var pollStatus bool
	err := prdb.client.QueryRow(checkSql, pollId).Scan(&pollStatus)

	if err != nil {
		if err == sql.ErrNoRows {
			log.Println("Poll does not exist", err.Error())
			return nil, customError.ErrBadRequest
		}
		log.Println("Error while checking for existence of poll", err.Error())
		return nil, errors.New("unexpected database error")
	}

	if pollStatus {
		log.Println("Poll has not ended")
		return nil, customError.ErrBadRequest
	}

	rows, querErr := prdb.client.Query(findSql, pollId)
	votes := make([]Vote, 0)

	if querErr != nil {
		log.Println("Error while querying votes for a given poll", err.Error())
		return nil, errors.New("unexpected database error")
	}

	for rows.Next() {
		var vote Vote
		err := rows.Scan(&vote.ID, &vote.User.ID, &vote.User.name, &vote.User.email, &vote.Option.ID, &vote.Option.Text)
		if err != nil {
			log.Println("Error while scanning votes for a given poll", err.Error())
			return nil, errors.New("unexpected database error")
		}
		votes = append(votes, vote)
	}
	return votes, nil

}

func (prdb PollRepositoryDB) UpdatePoll(pollId int, userId int, pollStatus bool) error {
	checkSql := `select exists(select 1 from poll where id = $1 and user_id = $2) as poll_created_by_user`
	updateSql := `update poll set status = $1 where id = $2`

	var poll_created_by_user bool
	err := prdb.client.QueryRow(checkSql, pollId, userId).Scan(&poll_created_by_user)

	if err != nil {
		log.Println("Error while checking for poll creation by a user", err.Error())
		return errors.New("unexpected database error")
	}

	if !poll_created_by_user {
		log.Println("Poll was not created by the user who made the request")
		return errors.New("user not authorized")
	}

	result, err := prdb.client.Exec(updateSql, pollStatus, pollId)
	if err != nil {
		log.Println("Error while updating status of a given poll", err.Error())
		return errors.New("unexpected database error")
	}

	count, err := result.RowsAffected()
	if err != nil {
		log.Println("Error while fetching the rows affected by update for a given poll", err.Error())
		return errors.New("unexpected database error")
	}

	if count == 1 {
		return nil
	} else {
		log.Println("Incorrect number of rows affected by the update", err.Error())
		return errors.New("unexpected database error")
	}
}

func NewPollRepositoryDB(dbClient *sql.DB) PollRepositoryDB {
	return PollRepositoryDB{
		client: dbClient,
	}
}
