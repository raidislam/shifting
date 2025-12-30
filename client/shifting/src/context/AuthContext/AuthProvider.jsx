import React, { Children, useEffect, useState } from 'react'
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { AuthContext } from './AuthContext'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import auth from '../../firebase/firebase.init';



const googleProvider = new GoogleAuthProvider();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)


    const createUser = function (email,password) {
        setLoading(true)
        return createUserWithEmailAndPassword(auth, email, password)
    }
    const signIn = function (email,password) { 
        setLoading(true)
        return signInWithEmailAndPassword(auth, email, password)
    }

    const userSignOut = function(){
        return signOut(auth)
    }

    const signInWithGoogle = function(){
        setLoading(true)
        return signInWithPopup(auth,googleProvider)
    }




    useEffect(()=>{
        const unSubcribe = onAuthStateChanged(auth,currentUser =>{
            setUser(currentUser);
            setLoading(false)
        });
        return ()=>{
            unSubcribe();
        }
    },[])


    const authInfo = {
        user,
        createUser,
        signIn,
        userSignOut,
        loading,
        signInWithGoogle
    }
    return (
        <AuthContext value={authInfo}>
            {children}
        </AuthContext>
    )
}
