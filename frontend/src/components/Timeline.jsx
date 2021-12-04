import { useEffect, useState } from "react";
import { Alert, Col, Row, Spinner } from "react-bootstrap";
import { ApiService } from "../services/ApiService";
import NewPost from "./NewPost";
import Post from "./Post";

const Timeline = ({type, user, showNewPost}) => {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState(null);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        if (type === 'home') {
            ApiService.fetchHomePosts()
            .then((res) => {
            if (res.data) setPosts(res.data);
            }).catch((err) => setError(err))
            .finally(() => setLoading(false));    
        } else if (type === 'user_profile'){
            ApiService.fetchUserPosts(user)
            .then((res) => {
                if (res.data) setPosts(res.data);
            }).catch(err => setError(err))
            .finally(() => setLoading(false))    
        }
    }, []);


    const appendPost = (post) => setPosts([post, ...posts]);
    const removePost = (deletingPostId) => setPosts(posts.filter((post) => post.post_id !== deletingPostId));
    const appendReply = (reply) => {
        let postsAux = posts;
        postsAux.splice(postsAux.findIndex((post) => post.post_id === reply.reply_to)+1, 0, reply);
        setPosts([...postsAux]);
    }

    return(
        <>
            <Row>
                <Col>
                    {showNewPost && <NewPost appendPost={appendPost}/>}
                </Col>
            </Row>
            <Row className="mt-3">
                <Col>
                    {loading && 
                        <div className="text-center">
                            <Spinner animation="border" variant="primary"/>
                        </div>}
                    {error && <Alert show variant="danger">{error}</Alert>}
                    {posts && !loading && !error && posts.length === 0 && <h6>No hay publicaciones</h6>}
                    {posts && !loading && !error && posts.map((post) => <Post key={post.post_id} post={post} removePost={removePost} appendReply={appendReply}/>)}
                </Col>
            </Row>
        </>
    );
};

export default Timeline;