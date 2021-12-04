import { useState } from "react";
import { Alert, Button, Form, FormControl, Spinner } from "react-bootstrap";
import { ApiService } from "../services/ApiService";

const NewReply = ({parent_post_id, appendReply}) => {
    const [replyBody, setReplyBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const submitNewReply = (ev) => {
        ev.preventDefault();
        setLoading(true);
        ApiService.submitNewReply(replyBody, parent_post_id)
        .then((res) => {
            if (res.success) {
                appendReply(res.data); //TODO: Retrieve new reply data from the server. 
                setReplyBody('');
            }
        }).catch((err) => setError(err))
        .finally(() => setLoading(false));
    };
    return(
        <Form>
            <Form.Group controlId="formNewReply">
                <FormControl className="mb-2" as="textarea" onChange={(ev) => setReplyBody(ev.target.value)} value={replyBody}/>
                <div className="d-flex flex-row">
                    <Button variant="primary" type="submit" disabled={!replyBody} onClick={submitNewReply}>Responder</Button>
                    {loading && <Spinner className="ml-3" animation="border" variant="primary"/>}    
                </div>
                {error && <Alert className="mt-2" show variant="danger">{error}</Alert>}
            </Form.Group>
        </Form>
    );
};

export default NewReply;