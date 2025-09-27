import React from 'react'
import {hasActiveSession, tryLogin} from "../utils/session.util";
import Button from "../components/button";

import '../index.css'
import './form.css'
import Link from "../router/link";

export default class Login extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            emailField: null,
            passwordField: null,
            message: null,
        }

        this.handleEmailChange = this.handleEmailChange.bind(this)
        this.handlePassChange = this.handlePassChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    componentDidMount()
    {
        if (hasActiveSession())
        {
            window.location.href = "/dashboard"
        }

        switch (this.props.justRegistered)
        {
            case '1':
                return this.displayMessage({
                    type: 'success',
                    message: 'Registered successfully! Now use your credentials to log in.'
                })
            case '2':
                return this.displayMessage({
                    type: 'success',
                    message: 'Password has been changed successfully! Now use your new credentials to log in.'
                })
            case '3':
                return this.displayMessage({
                    type: 'success',
                    message: 'It\'s sad to watch you go. Your account has been deleted.'
                })
            case '4':
                return this.displayMessage({
                    type: 'success',
                    message: 'You\'ve logged out of all devices. Wait up until 30 minutes for the changes to take effect.'
                })
            case '5':
                return this.displayMessage({
                    type: 'success',
                    message: 'You\'ve logged out. The session was deleted successfully.'
                })
            default:
                return
        }


    }

    handleEmailChange(event)
    {
        this.setState({emailField: event.target.value})
    }

    handlePassChange(event)
    {
        this.setState({passwordField: event.target.value})
    }

    displayMessage(message)
    {
        this.setState({message: message})
        setTimeout(() => this.setState({message: null}), 10000)
    }

    handleSubmit(event)
    {
        event.preventDefault()
        if (this.state.emailField && this.state.passwordField)
        {
            this.login(this.state.emailField, this.state.passwordField)
            console.log('Attemping login...')
        }
        else
        {
            this.displayMessage({type: "error", message: "Fill every field to log in."})
            console.log('Missing parameters.')
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

    login(email, password)
    {
        tryLogin(email, password).then(response =>
        {
            if (!response.success)
                return this.displayMessage({type: 'error', message: response.content})
            window.location.href = '/dashboard'
        })
    }

    render()
    {
        return <div className={"animated"} style={{
            background: "linear-gradient(-45deg, #471303, #52142c, #0d3646, #0c473a)",
            backgroundSize: "400% 400%"
        }}>
            <div className="container">
                <div className="logotype">👋 rar.vg</div>
                <form className="login-form" onSubmit={this.handleSubmit}>
                    {this.drawMessage(this.state.message)}
                    <h1 className="l p-no-margin-top">Log in</h1>
                    <input type="text" onChange={this.handleEmailChange}
                           placeholder="Email"/>
                    <input type="password" onChange={this.handlePassChange}
                           placeholder="Password"/>
                    <Button className="mm login-button" variant="primary">Submit</Button>
                    <div className={"links"}>
                        <Link to={"/forgot-password"}><span className={"ss"}>Forgot your password?</span></Link><br/>
                        <Link to={"/register"}><span className={"ss"}>Don't have an account?</span></Link><br/>
                    </div>
                </form>
            </div>
        </div>
    }
}