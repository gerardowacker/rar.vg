import React from 'react'
import {hasActiveSession, requestPasswordChange, tryRegister} from "../utils/session.util";

import '../index.css'
import './form.css'
import Link from "../router/link";

export default class ChangePassword extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            emailField: null,
            message: null,
            sent: false,
            requestDone: false,
        }

        this.handleEmailChange = this.handleEmailChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleEmailChange(event)
    {
        this.setState({emailField: event.target.value})
    }

    displayMessage(message)
    {
        this.setState({message: message})
        setTimeout(() => this.setState({message: null}), 10000)
    }

    handleSubmit(event)
    {
        event.preventDefault()
        if (this.state.emailField)
        {
            this.setState({requestDone: true})
            requestPasswordChange(this.state.emailField).then(response =>
            {
                this.setState({requestDone: false})
                if (!response.success)
                    this.displayMessage({type: 'error', message: response.content})

                this.setState({sent: true})
            })
        }
        else
        {
            this.displayMessage({type: "error", message: "Please complete every field."})
        }

    }

    drawMessage(message)
    {
        if (message) return (
            <div className={"message " + message.type}>
                {message.message}
            </div>
        )
    }

    renderFields = sent =>
    {
        return sent ? <div className='login-form'>
            <h1 className="mm p-no-margin-top">
                If an account is associated with that address, an email with a link has been sent in order to reset your
                password.
                Please check both your inbox and spam folder.</h1>
            <h1 className="m p-no-margin-bottom">You may close this tab.</h1>
        </div> : <form onSubmit={this.handleSubmit} className="login-form">
            {this.drawMessage(this.state.message)}
            <h1 className="l p-no-margin-top">Request a new password</h1>
            <input className="m" type="email" placeholder="Email" onChange={this.handleEmailChange}
                   disabled={this.state.requestDone}/>
            <button className="mm login-button" disabled={this.state.requestDone}>Send request</button>
        </form>
    }

    render()
    {
        return <div className={"animated"} style={{
            background: "linear-gradient(-45deg, #332b10, #521448, #0d460d, #0c4730)",
            backgroundSize: "400% 400%"
        }}>
            <div className="container">
                <div className="logotype">👋 rar.vg</div>
                {this.renderFields(this.state.sent)}
            </div>
        </div>
    }
}