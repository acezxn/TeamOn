import { IconButton, Menu, MenuItem, TextField, Typography } from "@mui/material"
import { useEffect, useRef, useState } from "react";
import { auth } from "../../utils/firebase";
import "../../css/Chatbox.css"
import Database from "../../utils/database";
import { onSnapshot } from "firebase/firestore";
import SendIcon from '@mui/icons-material/Send';
import UploadIcon from '@mui/icons-material/Upload';
import ClearIcon from '@mui/icons-material/Clear';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { v4 as uuidv4 } from 'uuid';



export const Chatbox = (props) => {
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedMessageIndex, setSelectedMessageIndex] = useState(0);
    const [messageHistory, setMessageHistory] = useState([]);
    const [files, setFiles] = useState([]);
    const [anchorElement, setAnchorElement] = useState(null);
    const userMenuExpanded = Boolean(anchorElement);

    const handleUserMenuClose = () => setAnchorElement(null);
    const messageBox = useRef();
    const imageTypes = ['image/gif', 'image/jpeg', 'image/png'];

    const sendMessage = async (event) => {
        event.preventDefault();
        if (isSending) {
            return;
        }

        setIsSending(true);
        if (message.trim() === "" && files.length === 0) {
            return;
        }

        var fileUrls = [];
        var filenames = [];
        var filetypes = [];

        for (let file of files) {
            const url = await Database.uploadFile(file, `teams/${props.teamId}/protected/attachments/${uuidv4()}-${file.name}`);
            fileUrls.push(url);
            filenames.push(file.name);
            filetypes.push(file.type);
        }

        const { uid, email, photoURL } = auth.currentUser;
        Database.TeamManager.MessageManager.createMessage({
            uid: uid,
            email: email,
            photoURL: photoURL,
            message: message,
            attachments: fileUrls,
            filenames: filenames,
            filetypes: filetypes,
            teamId: props.teamId
        });
        setMessage("");
        setFiles([]);
        setIsSending(false);
    };
    const selectMessage = (index, event) => {
        setSelectedMessageIndex(index);
        setAnchorElement(event.target);
    }
    const handleMessageDeletion = () => {
        handleUserMenuClose();
        Database.TeamManager.MessageManager.deleteMessage(messageHistory[selectedMessageIndex].id);
    }

    const handleFileChange = (e) => {
        setFiles([...files, ...e.target.files]);
    }

    const removeFile = (index) => {
        setFiles(files.filter((_, idx) => {
            return idx !== index;
        }));
    }

    useEffect(() => {
        if (props) {
            const snapshot = Database.TeamManager.MessageManager.getMessages(props.teamId);
            const unsubscribe = onSnapshot(snapshot, (querySnapshot) => {
                const messages = [];
                querySnapshot.forEach((doc) => {
                    messages.unshift({ ...doc.data(), id: doc.id });
                });
                const sortedMessages = messages.sort(
                    (a, b) => {
                        if (a.createTime === null) return 1;
                        if (b.createTime === null) return -1;
                        return a.createTime - b.createTime;
                    }
                );
                setMessageHistory(sortedMessages);
                if (messageBox.current) {
                    messageBox.current.scrollTop = messageBox.current.scrollHeight;
                }
            });
            return () => unsubscribe;
        }
    }, [props]);

    useEffect(() => {
        if (messageBox.current) {
            messageBox.current.scrollTop = messageBox.current.scrollHeight;
        }
    }, [messageBox.current]);
    return (
        <div className="chatbox">
            <div className="messages" ref={messageBox}>
                {messageHistory.map((message, index) => (
                    <>
                        {
                            message &&
                            (
                                <div key={index} className="message">
                                    <img
                                        src={message.photoURL}
                                        className="profile_image"
                                        alt="profile_image"
                                        style={{ verticalAlign: "top" }} />
                                    <div className="message_body">
                                        <div className="message_sender">
                                            <Typography sx={{ fontWeight: 600 }}>{message.email}</Typography>
                                        </div>
                                        <div className="message_create_time">
                                            <Typography sx={{ color: "var(--placeholder-color)", fontStyle: 'italic' }}>
                                                {
                                                    message.createTime && (
                                                        new Date(message.createTime.seconds * 1000).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                                year: 'numeric',
                                                                month: '2-digit',
                                                                day: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            }
                                                        )
                                                    )
                                                }
                                                {
                                                    (auth.currentUser.uid === message.uid || auth.currentUser.uid === props.data.ownerUID) && (

                                                        <IconButton style={{ marginLeft: 10 }} onClick={(e) => { selectMessage(index, e) }}>
                                                            <MoreVertIcon />
                                                        </IconButton>

                                                    )
                                                }
                                            </Typography>
                                        </div>
                                        <div className="message_content">
                                            <Typography sx={{ wordBreak: "break-word" }}>{message.message}</Typography>
                                            {
                                                message.attachments.map((url, index) => {
                                                    return (
                                                        <>
                                                            {
                                                                imageTypes.includes(message.filetypes[index]) ? (
                                                                    <a href={url}><img src={url} style={{ height: 250, overflow: "hidden" }}></img></a>
                                                                ) : (
                                                                    <a href={url} style={{ color: "inherit" }}>
                                                                        <FilePresentIcon sx={{ fontSize: 50, verticalAlign: "middle" }} />
                                                                        <Typography style={{ display: "inline-block", verticalAlign: "middle" }}>{message.filenames[index]}</Typography>
                                                                    </a>
                                                                )
                                                            }
                                                        </>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </>
                ))}
            </div>
            {
                files.length > 0 && (
                    <div style={{
                        position: "absolute",
                        top: "calc(100vh - 268px)",
                        padding: 10,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: 4,
                        width: "calc(100vw - 20px)"
                    }}>
                        {
                            files.map((file, index) => {
                                return (
                                    <div style={{
                                        display: "inline-block",
                                        padding: 10,
                                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                                        borderRadius: 4,
                                        overflow: "scroll",
                                        width: 200
                                    }}>
                                        <IconButton color="error" size="small" style={{ position: "absolute" }}>
                                            <ClearIcon color="error" onClick={() => { removeFile(index) }} />
                                        </IconButton>
                                        {
                                            imageTypes.includes(file.type) ? (
                                                <img src={URL.createObjectURL(file)} style={{ height: 150, width: 200, overflow: "hidden" }}></img>
                                            ) : (
                                                <FilePresentIcon sx={{ fontSize: 150 }} />
                                            )
                                        }

                                        <div style={{ overflow: "scroll", height: 30 }}>
                                            <Typography>{file.name}</Typography>
                                        </div>

                                    </div>
                                )
                            })
                        }
                    </div>
                )
            }
            <form
                className="message_form"
                style={{ display: "flex", alignItems: "center" }}
                onSubmit={(event) => sendMessage(event)}>
                <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="contained-button-file"
                    multiple
                    type="file"
                    onChange={handleFileChange}
                />
                <label htmlFor="contained-button-file">
                    <IconButton size="medium" component="span">
                        <UploadIcon />
                    </IconButton>
                </label>

                <TextField
                    style={{ width: "calc(100% - 100px)" }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    size="small"
                    placeholder="Type message here" />
                <IconButton type="submit" size="medium">
                    <SendIcon />
                </IconButton>
            </form>
            <Menu
                PaperProps={{
                    style: {
                        backgroundColor: "var(--background-color)",
                        color: "var(--foreground-color)"
                    }
                }}
                anchorEl={anchorElement}
                open={userMenuExpanded}
                onClose={handleUserMenuClose}
            >
                <MenuItem onClick={handleMessageDeletion} disableRipple>
                    Delete message
                </MenuItem>
            </Menu>
        </div>
    )
}