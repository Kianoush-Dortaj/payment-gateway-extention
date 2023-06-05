import React from "react"
import { render } from "react-dom"
import Popup from "./containers/Popup"
import "./style.css"
import { BrowserRouter } from "react-router-dom"

render(<React.StrictMode>
    <BrowserRouter>
        <Popup />
    </BrowserRouter>
</React.StrictMode>, document.getElementById("popup"))
