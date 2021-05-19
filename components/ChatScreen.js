import { Avatar, IconButton } from "@material-ui/core";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components"
import { auth, db } from "../firebase";
import firebase from 'firebase';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import { useCollection } from "react-firebase-hooks/firestore";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import MicIcon from '@material-ui/icons/Mic';
import { useRef, useState } from "react";
import Message from "./Message";
import getRecipientEmail from '../utils/getRecipientEmail'
import TimeAgo from 'timeago-react'

export const ChatScreen = ({ chat, messages }) => {
    const [user] = useAuthState(auth);
    const endOfMessageRef = useRef(null);
    const [input, setInput] = useState();
    const router = useRouter();
    const [messageSnapshot] = useCollection(db.collection('chats').doc(router.query.id).collection('messages').orderBy('timestamp', 'asc'))
    const [recipientSnapshot] = useCollection(db.collection('users').where('email', '==', getRecipientEmail(chat.users, user)))

    const showMessages = () => {
        if (messageSnapshot) {
            return messageSnapshot.docs.map(message => (
                <Message 
                    key={message.id}
                    user={message.data().user}
                    message={{
                        ...message.data(),
                        timestamp: message.data().timestamp?.toDate().getTime()
                    }}
                />
            ))
        } else {
            return JSON.parse(messages).map(message => (
                <Message 
                    key={message.id}
                    user={message.user}
                    message={message}
                />
            ));
        }
    }

    const sendMessage = e => {
        e.preventDefault();
        db.collection('users').doc(user.uid).set({
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        db.collection('chats').doc(router.query.id).collection('messages').add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            message: input,
            user: user.email,
            photoURL: user.photoURL
        })

        setInput('');
        scrollToBottom();
    }

    const scrollToBottom = () => {
        endOfMessageRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
    }

    const recipient = recipientSnapshot?.docs?.[0]?.data();
    const recipientEmail = getRecipientEmail(chat.users, user);
    return (
        <Container>
            <Header>
                {recipient ? (
                    <Avatar src={recipient?.photoURL} />
                ): (
                    <Avatar>{recipientEmail[0]}</Avatar>
                )}
                <HeaderInformation>
                    <h3>{recipientEmail}</h3>
                    {recipientSnapshot ? (
                        <p>
                            Last active: {' '}
                            {recipient?.lastSeen?.toDate() ? (
                                <TimeAgo datetime={recipient?.lastSeen?.toDate()} />
                            ): 'Unavailable'}
                        </p>
                    ): (
                        <p>
                            Loading Last active...
                        </p>
                    )}
                </HeaderInformation>
                <HeaderIcons>
                    <IconButton><MoreVertIcon /></IconButton>
                    <IconButton><AttachFileIcon /></IconButton>
                </HeaderIcons>
            </Header>

            <MessageContainer>
                {showMessages()}
                <EndOfMessage ref={endOfMessageRef} />
            </MessageContainer>

            <InputContainer>
                <InsertEmoticonIcon />
                <Input value={input} onChange={e => setInput(e.target.value)} />
                <button hidden disabled={!input} type="submit" onClick={sendMessage}>Send Message</button>
                <MicIcon />
            </InputContainer>
        </Container>
    )
}

const Container = styled.div `
`

const Header = styled.div `
    position: sticky;
    background-color: #fff;
    z-index: 100;
    top: 0;
    height: 5.8vw;
    display: flex;
    border-bottom: 1px solid whitesmoke;
    align-items: center;
`

const MessageContainer = styled.div `
    padding: 30px;
    background-color: #e5ded8;
    min-height: 90vh;
`
const Input = styled.input ` 
    flex: 1;
    outline: 0;
    border: none;
    border-radius: 10px;
    align-items: center;
    padding: 10px;
    position: sticky;
    background-color: whitesmoke;
    margin-left: 15px;
    margin-right: 15px;
`

const InputContainer = styled.form `
    display: flex;
    align-items: center;
    position: sticky;
    padding: 10px;
    background-color: white;
    z-index: 100;
    bottom: 0;
`

const EndOfMessage = styled.div `
    margin-bottom: 20px;
`

const HeaderInformation = styled.div `
    margin-left: 15px;
    flex: 1;

    > h3 {
        margin-bottom: 3px;
    }

    > p {
        font-size: 14px;
        color: grey;
    }
`

const HeaderIcons = styled.div `
`