import React from 'react'


class ErrorBoundry extends React.Component{
 constructor(props){
    super(props)
    this.state = {hasError : false , error:null}
 }


    static getDerivedStateFromError(error){
        return {hasError: true , error}
    }

    componentDidCatch(error,info){
        console.log(`Caught by Error Boundry`, error,info)
    }


    render(){
        if(this.state.hasError){
            return (
                <>
                <h2>Something Went Wrong</h2>
<p>{this.state.error?.message}</p>
                </>
            )
        }

        return this.props.children
    }
}


export default ErrorBoundry