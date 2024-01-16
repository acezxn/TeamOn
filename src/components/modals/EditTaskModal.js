import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import { useState } from "react";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "max(50vw, 340px)",
    height: "61vh",
    backgroundColor: 'var(--background-color)',
    borderRadius: 4,
    overflow: "hidden",
    overflowY: "scroll",
    zIndex: 1,
};


export const EditTaskModal = (props) => {
    const [editMode, setEditMode] = useState(false);

    // Current task data
    const [title, setTitle] = useState(props.taskData.title);
    const [description, setDescription] = useState(props.taskData.description);

    // Edited task data
    const [updatedTitle, setUpdatedTitle] = useState(props.taskData.title);
    const [updatedDescription, setUpdatedDescription] = useState(props.taskData.description);

    const handleTaskDelete = () => {
        props.onTaskDelete();
    }
    const handleTaskUpdate = () => {
        setTitle(updatedTitle);
        setDescription(updatedDescription);
        props.onTaskUpdate({ id: props.taskData.id, title: updatedTitle, description: updatedDescription });
    }
    return (
        <Box style={modalStyle}>
            <div style={{ margin: 10 }}>
                {!editMode ? (
                    <>
                        <br />
                        <Typography variant="h6" align="center">{title}</Typography>
                        <br />
                        <Typography sx={{ fontWeight: 600 }}>Description:</Typography>
                        <div style={{ height: "calc(61vh - 160px)", overflowY: "scroll" }}>
                            {description !== "" ? (
                                <Typography sx={{ wordBreak: "break-word" }}>{description}</Typography>
                            ) : (
                                <Typography sx={{ color: "var(--placeholder-color)", fontStyle: 'italic' }} align="center">No description provided</Typography>
                            )}
                        </div>
                        <Divider style={{ paddingBottom: 10 }} />
                        <Button onClick={() => {
                            setUpdatedTitle(title);
                            setUpdatedDescription(description);
                            setEditMode(true);
                        }}>Edit</Button>
                        <Button color="error" onClick={() => { handleTaskDelete() }}>Delete task</Button>
                    </>
                ) : (
                    <>
                        <br />
                        <Typography variant="h6" align="center">Edit task</Typography>
                        <Typography inputProps={{ maxLength: 100 }}>Task title:</Typography>
                        <TextField value={updatedTitle} onChange={(e) => { setUpdatedTitle(e.target.value) }}></TextField>
                        <Typography inputProps={{ maxLength: 400 }}>Task description</Typography>
                        <TextField value={updatedDescription} onChange={(e) => { setUpdatedDescription(e.target.value) }} style={{ width: "max(40vw, 220px)" }} rows={6} multiline required />
                        <Divider style={{ paddingBottom: 10 }} />
                        <Button onClick={() => {
                            handleTaskUpdate();
                            setEditMode(false);
                        }}>Save</Button>
                        <Button color="warning" onClick={() => { setEditMode(false) }}>Cancel</Button>
                    </>
                )}
            </div>
        </Box>
    )
}