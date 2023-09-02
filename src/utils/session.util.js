import config from './config.util'

function getCurrentSession()
{
    return {
        token: window.localStorage.getItem("__rvst"),
        clientToken: window.localStorage.getItem("__rarvg_client")
    }
}

function destroySession()
{
    window.localStorage.removeItem("__rvst")
    window.localStorage.removeItem("__rarvg_client")
}

function setCurrentSession(session)
{
    window.localStorage.setItem("__rvst", session.token)
    window.localStorage.setItem("__rarvg_client", session.clientToken)
}

function hasActiveSession()
{
    const session = getCurrentSession();
    return !(session.token == null || session.clientToken == null)
}

function updateToken(token)
{
    window.localStorage.setItem("__rvst", token)
}

function performRequest(endpoint, body)
{
    return new Promise(res =>
    {
        fetch(config('HOST') + '/' + endpoint,
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body)
            })
            .then(r =>
            {
                if (r.status !== 200)
                    return r.text().then(response => res({success: false, status: r.status, content: response}))
                r.json().then(response =>
                {
                    res({success: true, content: response})
                })
            })
    })
}

function tryRegister(displayName, username, email, password, dateOfBirth)
{
    return new Promise(res =>
    {
        performRequest('register', {
            displayName: displayName,
            email: email,
            password: password,
            username: username,
            dateOfBirth: dateOfBirth
        }).then(response =>
        {
            if (!response.success)
                return res(response)
            return res({success: true, content: response.content.user})
        })
    })
}

function tryLogin(email, password)
{
    return new Promise(res =>
    {
        performRequest('login', {email: email, password: password}).then(response =>
        {
            if (!response.success)
                return res(response)
            setCurrentSession({token: response.content.token, clientToken: response.content.clientToken})
            return res({success: true, content: response.content.user})
        })
    })
}

function tryUserLoading()
{
    return new Promise(res =>
    {
        const session = getCurrentSession()
        if (!session.token || !session.clientToken)
            return res({success: false})

        performRequest('getUser', session).then(response =>
        {
            if (response.status === 498)
                destroySession()
            if (response.content.token && response.content.token !== session.token)
                updateToken(response.content.token)
            return res(response)
        })
    })
}

function updateProfile(displayName, components, sociallinks)
{
    return new Promise(res =>
    {
        const session = getCurrentSession()
        if (!session.token || !session.clientToken)
            return res({success: false})

        performRequest('update', {...session, displayName: displayName, components: components, sociallinks: sociallinks}).then(response =>
        {
            if (response.status === 498)
                destroySession()
            if (response.content.token && response.content.token !== session.token)
                updateToken(response.content.token)
            return res(response)
        })
    })
}

function upload(file, avatar)
{
    console.log(file)
    return new Promise(res =>
    {
        const session = getCurrentSession()
        if (!session.token || !session.clientToken)
            return res({success: false})

        const data = new FormData()
        data.append('theFile', file)
        data.append('token', session.token)
        data.append('clientToken', session.clientToken)
        data.append('avatar', avatar ? '1' : '0')

        fetch(config('HOST') + '/files/upload', {
            method: 'POST',
            body: data
        }).then(r =>
        {
            if (r.status !== 200)
                return r.text().then(response => res({success: false, status: r.status, content: response}))
            r.text().then(response =>
            {
                return res({success: true, content: response})
            })
        })
    })
}

function verifyAccount(token)
{
    return new Promise(res =>
    {
        if (!token)
            return res({success: false, content: "Missing token."})

        performRequest('verify', {token: token}).then(response =>
        {
            if (!response.success)
                return res(response)
            return res({success: true, content: response.content.response})
        })
    })
}

function requestPasswordChange(email)
{
    return new Promise(res =>
    {
        if (!email)
            return res({success: false, content: "Missing email,"})

        performRequest('request-password-change', {email: email}).then(response =>
        {
            if (!response.success)
                return res(response)
            return res({success: true, content: response.content.response})
        })
    })
}

function verifyPasswordToken(token)
{
    return new Promise(res =>
    {
        if (!token)
            return res({success: false, content: "Missing token."})

        performRequest('verify-password-token', {token: token}).then(response =>
        {
            if (!response.success)
                return res(response)
            return res({success: true, content: response.content.response})
        })
    })
}

function updatePassword(token, password)
{
    return new Promise(res =>
    {
        if (!token || !password)
            return res({success: false, content: "Missing parameters."})

        performRequest('update-password', {token: token, password: password}).then(response =>
        {
            if (!response.success)
                return res(response)
            return res({success: true, content: response.content.response})
        })
    })
}

function deletionRequest(password){
    return new Promise(res =>
        {
            if (!password)
                return res({success: false, content: "Missing parameters."})
            
            const session = getCurrentSession()
            if (!session.token || !session.clientToken)
                return res({success: false})    
            
            performRequest('deletion-request', {...session, password: password}).then(response =>
            {
                if (!response.success)
                    return res(response)
                return res({success: true, content: response.content.response})
            })
        })
}

function verifyDeletionToken(token)
{
    return new Promise(res =>
    {
        if (!token)
            return res({success: false, content: "Missing token."})

        performRequest('verify-deletion-token', {token: token}).then(response =>
        {
            if (!response.success)
                return res(response)
            return res({success: true, content: response.content.response})
        })
    })
}

function deleteAccount(token)
{
    return new Promise(res =>
    {
        if (!token)
            return res({success: false, content: "Missing token."})

        performRequest('delete-account', {token: token}).then(response =>
        {
            if (!response.success)
                return res(response)

            destroySession()
            return res({success: true, content: response.content.response})
        })
    })
}

function validateSession()
{
    return new Promise(res =>
    {
        const session = getCurrentSession()
        if (!session.token || !session.clientToken)
            return res({success: false})

        performRequest('validate', session).then(response =>
        {
            if (!response.success)
                return res(response)
            updateToken(response.content.token)
            return res({success: true, content: response.content})
        })
    })
}

export {
    tryLogin, tryRegister, validateSession, tryUserLoading, hasActiveSession, updateProfile, upload, verifyAccount,
    updatePassword, requestPasswordChange, verifyPasswordToken, deletionRequest, verifyDeletionToken, deleteAccount
}