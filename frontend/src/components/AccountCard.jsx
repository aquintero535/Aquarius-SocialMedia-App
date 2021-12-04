import { Card, Image } from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL;

const AccountCard = ({account}) => {
    const handleClick = (ev) => window.location = `/${account.username}`;
    return(
        <Card className="p-2 mb-1" onClick={handleClick} style={{cursor:"pointer"}}>
            <div className="account-card-header d-flex flex-row">
                <div className="account-card-img">
                    <Image src={`${API_URL}${account.profile_image}`} width="50" alt="Imagen de perfil" roundedCircle/>
                </div>
                <div className="account-card-names ml-2">
                    <h5>{account.profile_name}</h5>
                    <h6>{account.username}</h6>
                </div>
            </div>
            <div className="account-card-info">
                <p>{account.profile_bio}</p>
            </div>
        </Card>
    );
};

export default AccountCard;