import { Container, Spinner } from "react-bootstrap";

export const Loader = ({ message = "Загрузка..." }) => {
    return (
        <Container className="text-center mt-5" >
            <Spinner animation="border" variant="success" />
            {message && <p className="mt-3">{message}</p>}
        </Container>
    )
}