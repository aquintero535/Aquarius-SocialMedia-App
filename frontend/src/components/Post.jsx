import { useState } from 'react';
import { Button, Card, DropdownButton, Dropdown, Image, Modal } from 'react-bootstrap';
import { useAuthState } from '../context/context';
import { ApiService } from '../services/ApiService';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import NewReply from './NewReply';

const API_URL = process.env.REACT_APP_API_URL;

const Post = ({post, isSinglePost, isReplyView, setShowingLikesModal, setShowingRepostsModal, appendReply, removePost}) => {
    const { user } = useAuthState();
    const [liked, setLiked] = useState(Boolean(post.already_liked));
    const [reposted, setReposted] = useState(Boolean(post.already_reposted));
    const [showingDeletePostModal, setShowingDeletePostModal] = useState(false);
    const likePost = () => {
        ApiService.togglePostLike(post.post_id, liked)
        .then((res) => {
            if (res.data) setLiked(res.data.liked);
        })
        .catch((err) => console.error(err))
    };
    const repostPost = () => {
        ApiService.toggleRepost(post.post_id, reposted)
        .then((res) => {
            if (res.data) setReposted(res.data.reposted);
        })
        .catch((err) => console.error(err));
    };
    const deletePost = () => {
        if (!post.reply_to){
            ApiService.deletePost(post.post_id)
            .then((res) => {
                if (res.success) {
                    setShowingDeletePostModal(false);
                    removePost(post.post_id);
                }
            }).catch((err) => console.error(err));   
        } else {
            ApiService.deleteReply(post.post_id, post.reply_to)
            .then((res) => {
                if (res.success) {
                    setShowingDeletePostModal(false);
                    removePost(post.post_id);
                }
            }).catch((err) => console.error(err));  
        }
    }

    const handleClick = (ev) => window.location = `/post/${post.post_id}`;
    const handleProfileImgClick = (ev) => window.location = `/${post.username}`;
    return(
        /* TODO: Find the way to dynamically change the background color of the card when hovering it. */
        <Card className="p-3 mb-3 post" onClick={!isSinglePost ? handleClick : undefined}>
            <ConfirmDeleteModal show={showingDeletePostModal} onHide={() => setShowingDeletePostModal(false)}
             deletePost={deletePost} setShowingDeletePostModal={setShowingDeletePostModal} onClick={(ev) => ev.stopPropagation()} />
            <div className="post-container" >
                <p>{post.reposted_by && <small>Reposteado por: <a href={`/${post.reposted_by}`}>@{post.reposted_by}</a></small>}</p>
                <p>{post.replying_to && <a href={`/post/${post.reply_to}`}><small>En respuesta al post de @{post.replying_to}</small></a> }</p>
                <div className="post-header d-flex flex-row">
                    <div className="post-header-img pt-3">
                        <Image onClick={handleProfileImgClick} src={`${API_URL}${post.profile_image}`} roundedCircle style={{width:"50px"}} /> 
                    </div>
                    <div className="post-header-data d-flex flex-column p-3">
                        <a href={`/${post.username}`} className="h5">{post.profile_name}</a>
                        <h6>@{post.username}</h6>
                    </div>
                </div>
                <div className="post-body">
                    <p>{post.body}</p>
                </div>
                <div className="post-buttons d-flex flex-row" onClick={(ev) => ev.stopPropagation()}>
                    <Button variant={(!liked ? 'primary' : 'danger')} onClick={likePost}>{!liked ? 'Me gusta' : 'Ya no me gusta'}</Button>
                    <Button className="ml-3" onClick={repostPost} variant={(!reposted ? 'primary' : 'danger')}>{!reposted ? 'Repost' : 'Deshacer repost'}</Button>
                    <DropdownButton className="ml-3"id="dropdown-basic-button" title="Acciones">
                        <Dropdown.Item href="#">Compartir</Dropdown.Item>
                        {(post.username === user.username) ? <Dropdown.Item onClick={() => setShowingDeletePostModal(true)}>Eliminar</Dropdown.Item> : null}
                        {(post.username !== user.username) ?<Dropdown.Item href="#">Reportar</Dropdown.Item> : null}
                    </DropdownButton>
                </div>
                <div className="d-flex flex-row">
                    <small className="p-3 underlined-clickable-text" onClick={() => setShowingLikesModal(true)}>Me gusta: {post.likes}</small>
                    <small className="p-3 underlined-clickable-text" onClick={() => setShowingRepostsModal(true)}>Reposts: {post.reposts}</small>
                    <small className="p-3">Respuestas: {post.replies}</small>
                    <small className="p-3">{new Date(post.created_at).toLocaleString()}</small>
                </div>
                <hr />
                {!isReplyView && 
                    <div onClick={(ev) => ev.stopPropagation()}>
                        <NewReply parent_post_id={post.post_id} appendReply={appendReply}/>
                    </div>}
            </div>    
        </Card>
    );
};

export default Post;