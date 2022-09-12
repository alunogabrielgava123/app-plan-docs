import React from "react";
import TextEdit from "./TextEdit";
import { BrowserRouter, Route, Redirect, Navigate, Routes } from 'react-router-dom'
import { v4 as uuidV4 } from 'uuid'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to={`/document/${uuidV4()}`} replace />}> </Route>
        <Route path='/document/:id' element={<TextEdit />}>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
