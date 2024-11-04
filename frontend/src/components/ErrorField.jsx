const ErrorField = ({message}) => {
    return <p className={`text-red-500 font-semibold ${message ? 'block' : 'hidden'}`}>
        {message}
    </p>
}

export default ErrorField;