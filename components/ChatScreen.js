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
import { useState } from "react";
import Message from "./Message";
import getRecipientEmail from '../utils/getRecipientEmail'

export const ChatScreen = ({ chat, messages }) => {
    const [user] = useAuthState(auth);
    const [input, setInput] = useState();
    const router = useRouter();
    const [messageSnapshot] = useCollection(db.collection('chats').doc(router.query.id).collection('messages').orderBy('timestamp', 'asc'))

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
    }

    const recipientEmail = getRecipientEmail(chat.users, user);

    return (
        <Container>
            <Header>
                <Avatar />
                <HeaderInformation>
                    <h3>{recipientEmail}</h3>
                    <p>Last seen...</p>
                </HeaderInformation>
                <HeaderIcons>
                    <IconButton><MoreVertIcon /></IconButton>
                    <IconButton><AttachFileIcon /></IconButton>
                </HeaderIcons>
            </Header>

            <MessageContainer>
                {showMessages()}
                <EndOfMessage />
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