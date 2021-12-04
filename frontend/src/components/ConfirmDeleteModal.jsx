import { Button, Modal } from "react-bootstrap";

const ConfirmDeleteModal = ({show, onHide, deletePost, setShowingDeletePostModal, onClick}) => {
    return(
        <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered scrollable onClick={onClick}>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Eliminar post
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que deseas eliminar este post?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={() => deletePost()}>Eliminar</Button>
                <Button variant="primary" onClick={() => setShowingDeletePostModal(false)}>Cancelar</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConfirmDeleteModal;