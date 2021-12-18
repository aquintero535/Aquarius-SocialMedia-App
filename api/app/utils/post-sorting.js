//Sort posts by date of submit and date of reposted.
const sortPostsByDate = function (post1, post2) {
    if (post1.repost_created_at || post2.repost_created_at){
        if (post1.repost_created_at > post2.created_at || post1.created_at > post2.repost_created_at || post1.repost_created_at > post2.repost_created_at)
        return -1;
        else if (post1.repost_created_at < post2.created_at || post1.created_at < post2.repost_created_at || post1.repost_created_at < post2.repost_created_at)
        return 1;
        else return 0;
    } else{
        if (post1.created_at === post2.created_at) return 0;
        return (post1.created_at > post2.created_at) ? -1 : 1;
    } 
}