// import SearchBar from "../Components/SearchBar/SearchBar";

let accessToken = '';

const clientID = '6d528ea181794599a0301d672804fe45';
const redirectURI = "http://jamming-martin.surge.sh";

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken
        }
        
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/)
        
        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1])
            window.setTimeout(() => accessToken = '' , expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
           let accessURL = "https://accounts.spotify.com/authorize?client_id=" + clientID + "&response_type=token&scope=playlist-modify-public&redirect_uri=" + redirectURI ;
           window.location = accessURL;
        }
    } ,

    search(term) {
        const accessToken = Spotify.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,  {
            headers: {Authorization: `Bearer ${accessToken}`}
            }).then(response => {
                return response.json();
            }).then(jsonResponse => {
                if (!jsonResponse.tracks) {
                    return [];
                } 
                return jsonResponse.tracks.items.map(track => ({
                        id : track.id,
                        name : track.name,
                        artist : track.artists[0].name, 
                        album : track.album.name,
                        uri : track.uri 
                    }));                
            });
    } ,

    savePlaylist(playlist, trackURIs) {
        if (!(playlist && trackURIs.length)) {
            return
        }

        const accessToken = Spotify.getAccessToken();
        const headers = {
            Authorization : 'Bearer ' + accessToken
        };
        let userID;

        return fetch('https://api.spotify.com/v1/me' ,  {
            headers: headers
            }).then(response => {
                return response.json();
            }).then(jsonResponse => {
                userID = jsonResponse.id
                return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, 
                    {
                        headers : headers,
                        method : 'POST',
                        body : JSON.stringify({ name : playlist })
                    }).then(response => {
                        return response.json();
                    }).then(jsonResponse => {
                        let playlistID = jsonResponse.id;
                        return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`,
                            {
                                headers : headers,
                                method : 'POST',
                                body : JSON.stringify({ uris : trackURIs })
                            })
                    })
            })
    } ,

}

export default Spotify;