import { useForm } from "react-hook-form";
import useAuth from "../../../hooks/useAuth";
import { Link, useLocation, useNavigate } from "react-router";
import SocialLogin from "../../../socialLogin/socialLogin";

export default function LoginComponent() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signIn } = useAuth()
    const location = useLocation();
    const navigate = useNavigate()
    const from = location?.state || '/';

    const loginSubmit = function (data) {
        signIn(data.email, data.password)
            .then(res => {
                console.log(res.user);
                navigate(from);
            })
            .catch(err => {
                console.log(err);
            })
    }

    return (
        <>
            <form onSubmit={handleSubmit(loginSubmit)}>
                <fieldset className="fieldset">
                    <label className="label">Email</label>
                    <input type="email" className="input" placeholder="Email" {...register('email')} />
                    <label className="label">Password</label>
                    <input type="password" className="input" placeholder="Password" {...register('password', {
                        required: true,
                        minLength: 6
                    })} />
                    {errors.password?.type === 'required' && <p className="text-error">Password is required</p>}
                    {errors.password?.type === 'minLength' && <p className="text-error">Password must be at least 6 characters</p>}
                    <div><a className="link link-hover">Forgot password?</a></div>
                    <button className="btn btn-neutral mt-4">Login</button>
                </fieldset>
                <p>Don't have an account? <Link to={'/register'} className="link link-hover">Sign Up</Link></p>
            </form>
            <SocialLogin from={from} />
        </>
    )
}
