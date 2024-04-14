import { Box, Button, Typography } from "@mui/material";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "max(30vw, 340px)",
    height: "25vh",
    backgroundColor: 'var(--background-color)',
    padding: 10,
    borderRadius: 4,
    overflow: "hidden",
    overflowY: "scroll",
    zIndex: 1,
};


export const ConfirmationModal = ({ onAccept, onDecline }) => {

    const handleAccept = (e) => {
        if (onAccept) {
            onAccept();
        }
    }
    const handleDecline = (e) => {
        if (onDecline) {
            onDecline();
        }
    }

    return (
        <Box style={modalStyle}>
            <br />
            <Typography variant="h6" align="center">Are you sure</Typography>
            <br />
            <Button style={{ width: "max(15vw, 170px)" }} onClick={handleAccept} variant="outlined" disableElevation>Yes</Button>
            <Button style={{ width: "max(15vw, 170px)" }} onClick={handleDecline} color="warning" variant="outlined" disableElevation>No</Button>
        </Box>
    )
}