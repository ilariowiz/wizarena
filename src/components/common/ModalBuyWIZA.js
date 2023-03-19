import React, { Component } from 'react';
import { connect } from 'react-redux'
import _ from 'lodash'
import { IoClose } from 'react-icons/io5'
import '../../css/Modal.css'
import {
    getWizaKDAPool,
    fetchAccountDetails
} from '../../actions'
import { TEXT_SECONDARY_COLOR, BACKGROUND_COLOR, CTA_COLOR } from '../../actions/types'


class ModalBuyWIZA extends Component {
    constructor(props) {
		super(props)

		this.state = {
			amount: '',
            loading: false,
            estimatedWiza: 0,
            wizaValue: 0,
            poolKda: 0,
            poolWiza: 0
		}
	}

    componentDidMount() {
        setTimeout(() => {
            this.loadWizaPrice()
            this.refreshUser()
        }, 1000)
    }

    refreshUser() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props
			//console.log(this.props)
		if (account && account.account) {
			this.props.fetchAccountDetails(account.account, chainId, gasPrice, gasLimit, networkUrl)
		}
	}

    loadWizaPrice() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getWizaKDAPool(chainId, gasPrice, gasLimit, networkUrl, (pool) => {
            //console.log(pool);

            let poolKda = pool.leg0.reserve.decimal ? pool.leg0.reserve.decimal : pool.leg0.reserve
            let poolWiza = pool.leg1.reserve.decimal ? pool.leg1.reserve.decimal : pool.leg1.reserve

            console.log(poolKda, poolWiza);

            this.setState({ poolKda: parseFloat(poolKda), poolWiza: parseFloat(poolWiza) })
        })
    }

    onlyNumbers(str) {
		return /^[0-9]+$/.test(str);
	}

    getEstimated(value) {
        const { poolKda, poolWiza } = this.state

        //0.3% fee
        let realKda = value - (value * 0.3 / 100)

        //console.log(realKda);

        let newPool1 = poolKda + realKda
        //console.log(newPool1);

        let newPool2 = poolKda * poolWiza / newPool1
        //console.log(newPool2);

        const newWizaValue = _.floor(1 / (newPool2 / newPool1), 4)
        //console.log(newWizaValue);

        let estimated = _.floor(poolWiza - newPool2, 6)

        return { estimated, wizaValue: newWizaValue }
    }

    changeValue(value) {
        const { poolKda, poolWiza } = this.state

        if (!poolKda && !poolWiza) {
            return
        }

        let estimatedWiza = this.getEstimated(value)

        this.setState({ amount: value, estimatedWiza: estimatedWiza.estimated, wizaValue: estimatedWiza.wizaValue })
    }



	render() {
		const { showModal, onCloseModal, width, account } = this.props;
        const { loading, estimatedWiza, wizaValue, amount } = this.state

		const classContainer = showModal ? "containerPopup" : "hidePopup"

        //console.log(account);

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width })}>

					<p style={{ color: 'white', fontSize: 22, textAlign: 'center', marginBottom: 10 }}>
						Swap
					</p>

					<div style={styles.boxWallet}>

                        <div style={styles.box}>

                            <div style={{ width: '100%', justifyContent: 'space-between', marginBottom: 10 }}>
                                <p style={{ fontSize: 14, color: 'white' }}>
                                    from KDA
                                </p>

                                <p style={{ fontSize: 14, color: '#c2c0c0' }}>
                                    balance: {_.floor(account.balance, 4)}
                                </p>
                            </div>

                            <input
                                style={styles.input}
                                type='text'
                                placeholder='enter amount'
                                value={this.state.amount}
                                onChange={(e) => this.changeValue(e.target.value)}
                            />

                        </div>

                        <div style={styles.box}>

                            <div style={{ width: '100%', justifyContent: 'space-between', marginBottom: 10 }}>
                                <p style={{ fontSize: 14, color: 'white' }}>
                                    to (estimated) WIZA
                                </p>


                            </div>

                            <div
                                style={Object.assign({}, styles.input, { alignItems: 'center' })}
                            >
                                {estimatedWiza}
                            </div>

                        </div>

                        <div style={{ width: '100%', justifyContent: 'space-between', marginBottom: 10 }}>
                            <p style={{ fontSize: 15, color: 'white' }}>
                                Price
                            </p>

                            <p style={{ fontSize: 15, color: 'white' }}>
                                {wizaValue} KDA per WIZA
                            </p>
                        </div>

                        <div style={{ width: '100%', justifyContent: 'space-between', marginBottom: 20 }}>
                            <p style={{ fontSize: 15, color: 'white' }}>
                                Max Splippage
                            </p>

                            <p style={{ fontSize: 15, color: 'white' }}>
                                0.05%
                            </p>
                        </div>


                        <button
                            className='btnH'
                            style={styles.btnConnect}
                            onClick={() => this.props.onSwap(amount, estimatedWiza)}
                        >
                            <p style={{ color: 'white', fontSize: 19 }}>
                                {loading ? "Loading..." : "SWAP"}
                            </p>
                        </button>

                    </div>

					<button
						style={{ position: 'absolute', right: 15, top: 15 }}
						onClick={onCloseModal}
					>
						<IoClose
							color='white'
							size={25}
						/>
					</button>

				</div>
			</div>
		)
	}
}


const styles = {
	subcontainer: {
		height: 400,
		backgroundColor: BACKGROUND_COLOR,
		borderRadius: 2,
		borderColor: TEXT_SECONDARY_COLOR,
		borderStyle: 'solid',
		borderWidth: 2,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative',
        padding: 10
	},
    boxWallet: {
		flexDirection: 'column',
		backgroundColor: 'transparent',
		paddingLeft: 12,
		paddingRight: 12,
		alignItems: 'center',
        width: '70%'
	},
	input: {
		width: '100%',
		height: 40,
		borderWidth: 1,
		borderColor: 'lightgrey',
		borderStyle: 'solid',
		borderRadius: 2,
		fontSize: 15,
		color: 'white',
		paddingLeft: 8,
		paddingRight: 8,
		WebkitAppearance: 'none',
		MozAppearance: 'none',
		appearance: 'none',
		outline: 'none',
        backgroundColor: 'transparent',
        marginBottom: 10
	},
	btnConnect: {
		width: 200,
		height: 40,
		backgroundColor: CTA_COLOR,
		borderRadius: 2,
	},
    box: {
        flexDirection: 'column',
        backgroundColor: '#1b1930',
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: 24,
        paddingRight: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
        borderRadius: 2
    }
}

const mapStateToProps = (state) => {
    const { account, chainId, gasPrice, gasLimit, networkUrl, netId } = state.mainReducer

    return { account, chainId, gasPrice, gasLimit, networkUrl, netId }
}

export default connect(mapStateToProps, {
    getWizaKDAPool,
    fetchAccountDetails
})(ModalBuyWIZA)
