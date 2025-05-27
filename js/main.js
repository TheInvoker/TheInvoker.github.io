if ('IdentityCredential' in window) {
    // AJAX call to login
    navigator.login.setStatus('logged-in');


    // TODO handle user canceling
    const credential = await navigator.credentials.get({
        identity: {
            // Specify the IdP (or multiple IdPs, supported from Chrome 136) this Relying Party supports
            providers: [
                {
                    //configURL: new URL('/.well-known/fedcm.json', window.location.origin).toString(), 
                    configURL: 'https://accounts.google.com/gsi/fedcm.json',        
                    clientId: '676807901260-k8i0etl2o5lm04s9ra772j4q3jaans1o.apps.googleusercontent.com',
                    nonce: crypto.randomUUID() 
                }
            ]
        }
    });
    console.log(credential);

    
}