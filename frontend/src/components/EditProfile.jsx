import {useState} from 'react';
import { Alert, Button, Form, FormControl, Image, Modal, Spinner } from 'react-bootstrap';
import { ApiService } from '../services/ApiService';

const API_URL = process.env.REACT_APP_API_URL;

const EditProfile = ({show, onHide, profile, setProfile, user}) => {
    const [form, setForm] = useState({
        profile_name: profile.profile_name,
        profile_bio: profile.profile_bio
    });
    const [header, setHeader] = useState(`${API_URL}${profile.profile_header}`);
    const [profileImage, setProfileImage] = useState(`${API_URL}${profile.profile_image}`);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleChange = (ev) => {
        setForm({...form, [ev.target.name]: (ev.target.files) 
            ? ev.target.files[0] 
            : ev.target.value
        });
        if (ev.target.name === 'profile_header'){
            let reader = new FileReader();
            reader.readAsDataURL(ev.target.files[0]);
            reader.addEventListener('load', (ev) => {
                setHeader(reader.result);
            })
        }
        if (ev.target.name === 'profile_image'){
            let reader = new FileReader();
            reader.readAsDataURL(ev.target.files[0]);
            reader.addEventListener('load', () => {
                setProfileImage(reader.result);
            })
        }
    };
    const handleSubmit = (ev) => {
        ev.preventDefault();
        setLoading(true);
        ApiService.editUserProfile(user, form)
        .then((res) => {
            if (res.success) {
                setProfile({
                    ...profile,
                    profile_name: form.profile_name,
                    profile_bio: form.profile_bio,
                    profile_header: res.data.profile_header || profile.profile_header,
                    profile_image: res.data.profile_image || profile.profile_image
                });
                onHide();
            }
        }).catch(err => setError(err))
        .finally(() => setLoading(false));
    };

    return(
        <Modal show={show} onHide={onHide} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Editar perfil
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="edit-profile-header pb-5 border-bottom">
                        <h5>Encabezado</h5>
                        <Image className="mt-3" fluid src={header} />
                        <Form.File label="Selecciona un archivo" accept=".jpg, .png" className="mt-3" data-browse="Examinar" name="profile_header"  onChange={handleChange} />
                    </div>
                    <div className="edit-profile-profile-image mt-3 pb-5 border-bottom">
                        <h5>Imagen de perfil</h5>
                        <Image src={profileImage} roundedCircle className="w-25 p-3" />
                        <Form.File label="Selecciona un archivo" accept=".jpg, .png" className="mt-3" data-browse="Examinar" name="profile_image" onChange={handleChange} />
                    </div>
                    <div className="edit-profile-name mt-3 pb-5 border-bottom">
                        <h5>Nombre de perfil</h5>
                        <FormControl className="mt-3" defaultValue={profile.profile_name} type="text" placeholder="Nombre para mostrar" name="profile_name" onChange={handleChange} />
                    </div>
                    <div className="edit-profile-bio mt-3 pb-3">
                        <h5>Tu biografía</h5>
                        <Form.Control className="mt-3" as="textarea" rows={3} placeholder="Escribe aquí tu biografía." defaultValue={profile.profile_bio} name="profile_bio" onChange={handleChange} />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    {loading && <Spinner animation="border" variant="primary" className="mr-3"/>}
                    {error && <Alert show variant="danger">{error}</Alert>}
                    <Button variant="success" type="submit">Guardar cambios</Button>
                    <Button onClick={onHide} variant="danger">Cerrar</Button>
                </Modal.Footer>    
            </Form>
        </Modal>
    );
};

export default EditProfile;