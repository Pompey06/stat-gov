// src/components/Login/Login.jsx

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import logo from "../../assets/logo.svg";
import hide from "../../assets/hide.svg";
import wrong from "../../assets/wrong.svg";
import "./Login.css";
import Button from "../Button/Button";
import { useAuth } from "../../hooks/useAuth.js";

const STORAGE_LOGIN_KEY = "adminLogin";
const STORAGE_PASSWORD_KEY = "adminPassword";

const Login = ({ onLogin }) => {
   const { checkAdmin } = useAuth();
   const [login, setLogin] = useState("");
   const [password, setPassword] = useState("");
   const [remember, setRemember] = useState(false);
   const [loginError, setLoginError] = useState(false);
   const [passwordError, setPasswordError] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
   const [checkingStored, setCheckingStored] = useState(true);

   // При монтировании пытаемся автоматически залогинить по сохранённым в localStorage данным
   useEffect(() => {
      const storedLogin = localStorage.getItem(STORAGE_LOGIN_KEY);
      const storedPassword = localStorage.getItem(STORAGE_PASSWORD_KEY);
      if (storedLogin && storedPassword) {
         checkAdmin(storedLogin, storedPassword)
            .then((isValid) => {
               if (isValid) {
                  onLogin(storedLogin, storedPassword);
               } else {
                  // Если невалидны — чистим storage
                  localStorage.removeItem(STORAGE_LOGIN_KEY);
                  localStorage.removeItem(STORAGE_PASSWORD_KEY);
                  setCheckingStored(false);
               }
            })
            .catch(() => {
               setCheckingStored(false);
            });
      } else {
         setCheckingStored(false);
      }
   }, [checkAdmin, onLogin]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoginError(false);
      setPasswordError(false);

      let valid = true;
      if (login.trim() === "") {
         setLoginError(true);
         valid = false;
      }
      if (password.trim() === "") {
         setPasswordError(true);
         valid = false;
      }
      if (!valid) return;

      const isValidAdmin = await checkAdmin(login, password);
      if (isValidAdmin) {
         if (remember) {
            localStorage.setItem(STORAGE_LOGIN_KEY, login);
            localStorage.setItem(STORAGE_PASSWORD_KEY, password);
         }
         onLogin(login, password);
      } else {
         setPasswordError(true);
      }
   };

   const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
   };

   // Пока проверяем сохранённые данные, ничего не рендерим (или можно спиннер)
   if (checkingStored) {
      return null;
   }

   return (
      <div className="login-wrapper">
         <img src={logo} alt="logo" className="logo" />
         <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
               <label htmlFor="login">Логин</label>
               <input
                  type="text"
                  id="login"
                  value={login}
                  onChange={(e) => {
                     setLogin(e.target.value);
                     if (e.target.value.trim()) setLoginError(false);
                  }}
                  placeholder="Введите Ваш логин"
                  className={loginError ? "error" : ""}
               />
            </div>
            <div className="form-group">
               <label htmlFor="password">Пароль</label>
               <div className="password-wrapper">
                  <input
                     type={showPassword ? "text" : "password"}
                     id="password"
                     value={password}
                     onChange={(e) => {
                        setPassword(e.target.value);
                        if (e.target.value.trim()) setPasswordError(false);
                     }}
                     placeholder="Введите Ваш пароль"
                     className={passwordError ? "error" : ""}
                  />
                  <img
                     src={hide}
                     alt="toggle password visibility"
                     className="hide"
                     onClick={togglePasswordVisibility}
                  />
               </div>
               {passwordError && (
                  <div className="wrong__wrapper">
                     <img src={wrong} alt="wrong" className="wrong" />
                     <p className="wrong__text">Неверный логин или пароль</p>
                  </div>
               )}
            </div>
            <div className="form-group checkbox-group">
               <label className="remember" htmlFor="remember">
                  <input
                     type="checkbox"
                     id="remember"
                     checked={remember}
                     onChange={(e) => setRemember(e.target.checked)}
                  />
                  Запомнить
               </label>
            </div>
            <Button type="submit" className="login-button">
               Войти
            </Button>
         </form>
      </div>
   );
};

Login.propTypes = {
   onLogin: PropTypes.func.isRequired,
};

export default Login;
