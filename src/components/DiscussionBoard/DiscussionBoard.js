import { Button, IconButton, List, ListItem, ListItemText, Menu, MenuItem, Modal, Typography } from "@mui/material"
import AnnouncementIcon from '@mui/icons-material/Announcement';
import { NewDiscussionModal } from "../modals/NewDiscussionModal";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useEffect, useState } from "react";
import Database from "../../utils/database";
import { onSnapshot } from "firebase/firestore";
import { ConfirmationModal } from "../modals/ConfirmationModal";

export const DiscussionBoard = (props) => {
    const [anchorElement, setAnchorElement] = useState(null);
    const [selectedDiscussionIndex, setSelectedDiscussionIndex] = useState(-1);
    const [discussionHistory, setDiscussionHistory] = useState([]);
    const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
    const [newDiscussionModalOpen, setNewDiscussionModalOpen] = useState(false);
    const handleDeleteConfirmModalOpen = () => setDeleteConfirmModalOpen(true);
    const handleDeleteConfirmModalClose = () => setDeleteConfirmModalOpen(false);
    const handleNewDiscussionModalOpen = () => setNewDiscussionModalOpen(true);
    const handleNewDiscussionModalClose = () => setNewDiscussionModalOpen(false);
    const handleMenuClose = () => setAnchorElement(null);
    const menuExpanded = Boolean(anchorElement);

    const handleDiscussionDelete = () => {
        handleMenuClose();
        Database.TeamManager.DiscussionManager.deleteDiscussion(discussionHistory[selectedDiscussionIndex].id)
    }

    useEffect(() => {
        if (props) {
            const snapshot = Database.TeamManager.DiscussionManager.getDiscussions(props.teamId);
            const unsubscribe = onSnapshot(snapshot, (querySnapshot) => {
                const discussions = [];
                querySnapshot.forEach((doc) => {
                    discussions.unshift({ ...doc.data(), id: doc.id });
                });
                const sortedDiscussions = discussions.sort(
                    (a, b) => {
                        if (a.createTime === null) return -1;
                        if (b.createTime === null) return 1;
                        return b.createTime - a.createTime;
                    }
                );
                setDiscussionHistory(sortedDiscussions);
                // if (messageBox.current) {
                //     messageBox.current.scrollTop = messageBox.current.scrollHeight;
                // }
            });
            return () => unsubscribe;
        }
    }, [props]);
    return (
        <div style={{ marginLeft: 10, marginRight: 10 }}>
            {/* <Typography>To be implemented</Typography> */}
            <Modal
                open={newDiscussionModalOpen}
                onClose={handleNewDiscussionModalClose}>
                <NewDiscussionModal teamId={props.teamId} onModalClose={handleNewDiscussionModalClose} />
            </Modal>
            <Modal
                open={deleteConfirmModalOpen}
                onClose={handleDeleteConfirmModalOpen}>
                <ConfirmationModal
                    onDecline={() => {
                        handleDeleteConfirmModalClose();
                        handleMenuClose();
                    }}
                    onAccept={() => {
                        handleDiscussionDelete();
                        handleDeleteConfirmModalClose();
                        handleMenuClose();
                    }} />
            </Modal>
            <Menu
                anchorEl={anchorElement}
                open={menuExpanded}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => { setDeleteConfirmModalOpen(true) }} disableRipple>
                    Delete
                </MenuItem>
            </Menu>
            <Button
                variant="outlined"
                onClick={handleNewDiscussionModalOpen}
                style={{ position: "absolute", top: "calc(100vh - 50px)" }}>
                New discussion
            </Button>
            {
                discussionHistory.length === 0 ? (
                    <Typography align="center" style={{ color: "var(--placeholder-color)", fontStyle: "italic" }}>No discussions available</Typography>
                ) : (
                    <List variant="outlined" style={{ maxHeight: "calc(100vh - 180px)", overflow: "auto", backgroundColor: "var(--board-dark-color)" }}>
                        {
                            discussionHistory.map((discussion, index) => (
                                <ListItem style={{ padding: 0 }} key={index}>
                                    <Button
                                        color="inherit"
                                        size="small"
                                        fullWidth={true}
                                        style={{ padding: 10, textTransform: "none", textAlign: "left" }}
                                        onClick={() => { }}>
                                        <ListItemText>
                                            <AnnouncementIcon style={{ verticalAlign: "middle" }} />
                                            <label style={{ padding: 10 }}>{discussion.title}</label>
                                            <label style={{ float: "right", verticalAlign: "middle", color: "var(--placeholder-color)", fontStyle: "italic" }}>
                                                {
                                                    discussion.createTime && (
                                                        new Date(discussion.createTime.seconds * 1000).toLocaleDateString(
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
                                            </label>
                                        </ListItemText>
                                    </Button>
                                    <IconButton onClick={(e) => {
                                        setSelectedDiscussionIndex(index);
                                        setAnchorElement(e.target);
                                    }}
                                        style={{ float: "right", verticalAlign: "middle", padding: 10 }}>
                                        <MoreVertIcon />
                                    </IconButton>
                                </ListItem>
                            ))
                        }
                    </List>
                )
            }

        </div>
    )
}