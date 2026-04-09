import { Container, Spinner } from "react-bootstrap";

export const GreenLoader = ({ message = "Загрузка..." }) => {
    return (
        <Container className="text-center mt-5" >
            <Spinner animation="border" variant="success" />
            {message && <p className="mt-3">{message}</p>}
        </Container>
    )
}

export const RedLoader = ({ message = "Загрузка..." }) => {
    return (
        <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Spinner animation="border" variant="danger" />

            {message && <p className="mt-3 text-danger fw-bold">{message}</p>}
        </Container>
    )
}

export const CreatingGroupLoader = ({ message = "Загрузка..." }) => {
    return (
        <Container className="text-center mt-5" >
            <Spinner animation="border" variant="success" />
            {message && <p className="mt-3">{message}</p>}
        </Container>
    )
}