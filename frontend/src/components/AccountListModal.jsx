import { useEffect, useState } from "react";
import { Alert, Modal, Spinner } from "react-bootstrap";
import { ApiService } from "../services/ApiService";
import AccountCard from "./AccountCard";

const AccountListModal = ({show, onHide, type, post_id}) => {
    const [accounts, setAccounts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (show === true) {
            setLoading(true);
            if (type === 'likes'){
                ApiService.fetchLikingAccounts(post_id)
                .then((res) => {
                    if (res.data) setAccounts(res.data)
                })
                .catch((err) => setError(err))
                .finally(() => setLoading(false));
            } else if (type === 'reposts'){
                ApiService.fetchRepostingAccounts(post_id)
                .then((res) => {
                    if (res.data) setAccounts(res.data)
                })
                .catch((err) => setError(err))
                .finally(() => setLoading(false));
            }    
        }
    }, [show, type, post_id]);

    const hideModal = () => {
        onHide();
        setAccounts(null);
        setError(null);
    };
    return(
        <Modal show={show} onHide={hideModal} size="lg" aria-labelledby="contained-modal-title-vcenter" centered scrollable>
            <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        {(type === 'likes') ? 'Usuarios que dieron me gusta' : 'Usuarios que hicieron repost'}
                    </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading && 
                    <div className="text-center p-3">
                        <Spinner animation="border" variant="primary"/>
                    </div>
                }
                {error && <Alert show variant="danger">{error}</Alert>}
                {accounts && accounts.map((acc) => <AccountCard key={acc.profile_id} account={acc}/>)}
                {accounts && accounts.length === 0 && <p>{(type === 'likes') 
                            ? 'Aún nadie ha dado me gusta.'
                            : 'Aún nadie ha hecho repost.'}</p>}
            </Modal.Body>
        </Modal>
    );
};

export default AccountListModal;