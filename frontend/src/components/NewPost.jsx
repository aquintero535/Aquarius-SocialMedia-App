import { useState } from 'react';
import { Alert, Button, Card, Form, FormControl, Spinner } from 'react-bootstrap';
import { ApiService } from '../services/ApiService';


const NewPost = ({appendPost}) => {
    const [postBody, setPostBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const submitNewPost = (ev) => {
        if (!postBody) return;
        setLoading(true);
        ApiService.submitNewPost(postBody)
        .then((res) => {
            if (res.success) {
                setPostBody('');
                setResponse('Your post has been sent.');
                appendPost(res.data);
                setTimeout(() => setResponse(null), 4000);
            }
        }).catch((err) => setError(err))
        .finally(() => setLoading(false));
    };
    return(
        <Card className="p-2 mb-2">
            <Form>
                <Form.Group controlId="formNewPost">
                    <h6>Nueva publicación</h6>
                    <FormControl as="textarea" onChange={(ev) => setPostBody(ev.target.value)} value={postBody}/><br/>
                    <div className="d-flex flex-row">
                        <Button variant="primary" disabled={!postBody} onClick={submitNewPost}>Enviar</Button>
                        {loading && <Spinner className="ml-3" animation="border" variant="primary"/>}
                    </div>
                </Form.Group>
            </Form>
            {response && <Alert show variant="success">{response}</Alert>}
            {error && <Alert show variant="danger">{error}</Alert>}
        </Card>
    );
};

export default NewPost;