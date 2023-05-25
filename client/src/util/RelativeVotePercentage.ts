export function calculateRelativeVotePercentage(voteMap: Map<number, number>): [Map<number, number>, number] {
    let totalVotes: number = 0;
    for (let value of voteMap.values()) {
        totalVotes += value;
    }

    let newVoteMap = new Map<number, number>();
    for (let key of voteMap.keys()) {
        let voteCount = voteMap.get(key)
        newVoteMap.set(key, ((voteCount || 0) / totalVotes) * 100)
    }
    return [newVoteMap, totalVotes];
}

