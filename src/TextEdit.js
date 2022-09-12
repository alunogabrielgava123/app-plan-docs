import React, { useEffect, useRef, useCallback, useState } from 'react'
import "quill/dist/quill.snow.css"
import Quill from 'quill'
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom';


// var toolbarOptions = [
//     ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
//     ['blockquote', 'code-block'],

//     [{ 'header': 1 }, { 'header': 2 }],               // custom button values
//     [{ 'list': 'ordered' }, { 'list': 'bullet' }],
//     [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
//     [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
//     [{ 'direction': 'rtl' }],                         // text direction

//     [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
//     [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

//     [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
//     [{ 'font': [] }],
//     [{ 'align': [] }],

//     ['clean']                                         // remove formatting button
// ];






export default function TextEdit() {

    //Variavies globais
    const [socket, setSocket] = useState();
    const [quill, setQuill] = useState();
    const { id: documentId } = useParams();
    const [saving, setSeving] = useState(false);
    const [content, setContent] = useState();

    //Conectando o socket no servidor
    useEffect(() => {
        const s = io('http://localhost:3001');
        setSocket(s);

        return () => {
            s.disconnect();
        }
    }, []);


    function savingElement() {
        //Buscar o elemento superior da toolbar;
        setSeving(true)
        document.getElementsByClassName('ql-toolbar ql-snow')[0].getElementsByClassName('class-saving')[0].innerHTML = 'Saving..'
    }

    function notSaving() {
        setSeving(false);
        //Buscar o elemento superior da toolbar;
        document.getElementsByClassName('ql-toolbar ql-snow')[0].getElementsByClassName('class-saving')[0].innerHTML = ''
    }

    //Emiting save 
    useEffect(() => {

        //Setando elemento;
        savingElement();

        const handler = () => {
            notSaving();
        }

        const setOut = setTimeout(() => handler(), 1000);

        return () => {
            clearTimeout(setOut);
        }


    }, [content])


    //Save changes
    useEffect(() => {
        if (quill == null || socket == null) return

        const interval = setInterval(() => {
            socket.emit('save-changes', quill.getContents());
        }, 1000);

        return () => {
            clearInterval(interval);
        }

    }, [socket, quill])



    //Loading data e buscando os elementos vizuais que estao mudando
    useEffect(() => {
        if (socket == null || quill == null) return;

        socket.once('load-document', document => {
            quill.setContents(document);
            quill.enable();
        });

        socket.emit('get-document', documentId);
    }, [socket, quill, documentId]);


    //Recebendo dados do usuario e modificando o quill
    useEffect(() => {

        if (socket == null || quill == null) return;

        const handler = delta => {
            quill.updateContents(delta);
        }

        socket.on('receive-changes', handler);

        return () => {
            socket.off('receive-changes', handler);
        }
    }, [socket, quill])

    //Enviando dados para o servidor 
    useEffect(() => {

        if (socket == null || quill == null) return;

        const handler = (delta, oldDelta, source) => {
            if (source !== "user") return;
            socket.emit('send-changes', delta, oldDelta);
            setContent(delta);
        }

        quill.on('text-change', handler);

        return () => {
            quill.off('text-change', handler);
        }
    }, [socket, quill])

    //Evintando que o elemento seja redenizado mais de uma vez;
    const refContainer = useCallback(container => {
        if (container == null) return;

        container.innerHTML = '';
        const editor = document.createElement('div');
        container.append(editor);
        const q = new Quill(editor, {
            theme: 'snow', modules: {

            }
        });

        const span = document.createElement('div');
        span.style.fontSize = '10px';
        span.classList.add('class-saving')
        document.getElementsByClassName('ql-toolbar ql-snow')[0].appendChild(span);

        q.disable();
        q.setText('Loading...');
        setQuill(q);

    }, []);

    return (
        <>
            <div className='container' ref={refContainer}></div>
        </>)
}
