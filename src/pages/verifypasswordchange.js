import React from 'react'
import {updatePassword, verifyPasswordToken} from "../utils/session.util";
import Button from "../components/button";

import '../index.css'
import './form.css'

export default class VerifyPasswordChange extends React.Component
{
    constructor(props)
    {
        super(props)

        this.state = {
            verified: null,
            passRes: null,
            passwordField: null,
            passConfField: null,
            message: null,
        }

        this.handlePassChange = this.handlePassChange.bind(this)
        this.handlePassConfChange = this.handlePassConfChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    componentDidMount()
    {
        const token = this.props.token
        verifyPasswordToken(token).then(response =>
        {
            this.setState({verified: response})
        })
    }

    handleSubmit(event)
    {
        event.preventDefault()
        if (this.state.passwordField && this.state.passConfField)
        {
            if (this.state.passwordField !== this.state.passConfField)
                return this.displayMessage({type: "error", message: "Passwords don't match! Try again."})

            if (this.state.passwordField.length < 8 || !/\d/.test(this.state.passwordField))
                return this.displayMessage({
                    type: "error",
                    message: "Password must be composed of at least 8 characters and one number."
                })

            updatePassword(this.props.token, this.state.passwordField).then(response =>
            {
                if (!response.success)
                    return this.displayMessage({type: 'error', message: response.content})

                window.location.href = '/login?jr=2'
            })
        }
        else
        {
            console.log(this.state)
            this.displayMessage({type: "error", message: "Please complete every field before registering."})
        }
    }

    handlePassChange(event)
    {
        this.setState({passwordField: event.target.value})
    }

    handlePassConfChange(event)
    {
        this.setState({passConfField: event.target.value})
    }

    drawMessage(message)
    {
        if (message) return (
            <div className={"message " + message.type}>
                {message.message}
            </div>
        )
    }

    displayMessage(message)
    {
        this.setState({message: message})
        setTimeout(() => this.setState({message: null}), 10000)
    }

    renderFields = verified =>
    {
        if (verified === null)
            return <div className={"login-form"}><h3 className='mm'>Loading...</h3></div>

        if (verified.success)
            return <form onSubmit={this.handleSubmit} className="login-form">
                {this.drawMessage(this.state.message)}
                <h1 className="l p-no-margin-top">Please, insert new password</h1>
                <input className={"m"} type="password" placeholder="Insert your password"
                       onChange={this.handlePassChange}/>
                <input className={"m"} type="password" placeholder="Repeat your password"
                       onChange={this.handlePassConfChange}/>
                <Button className="mm login-button" variant="primary">Confirm</Button>
            </form>
        else
            return <div className="login-form">
                <h1 className="m p-no-margin-top">{verified.content}</h1>
            </div>
    }

    render()
    {
        return <div className={"animated"} style={{
            background: "linear-gradient(-45deg, #381b12, #3b0f38, #02394d, #462506)",
            backgroundSize: "400% 400%"
        }}>
            <div className="container">
                <div className="logotype">👋 rar.vg</div>
                {this.renderFields(this.state.verified)}
            </div>
        </div>
    }
}