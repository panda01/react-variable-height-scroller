import React from 'react';
import './Scroller.css';
import { throttle } from 'throttle-debounce';


class Scroller extends React.Component {
	constructor(props) {
		super(props);
		this.$innerWrapper = React.createRef();
		this.$spacer = React.createRef();
		this.state = {
			itemsPerPage: 400,
			startPageIdx: 0,
			endPageIdx: 3
		}
		this.handleScrollEvt = throttle(200, this.handleScrollEvt.bind(this));
	}
	handleScrollEvt(evt) {
		const innerWrapperRect = this.$innerWrapper.current.getBoundingClientRect();
		const mainEl = this.$innerWrapper.current.parentElement.parentElement;

		const tooMuchOnTop = Math.abs(innerWrapperRect.top) > this.threshold;
		console.log('innerWrapperRect.top', innerWrapperRect.top);
		console.log('scrollTop', mainEl.scrollTop);

		const distanceToBottom = innerWrapperRect.bottom - mainEl.clientHeight;
		const isCloseToEndOfList = distanceToBottom < this.threshold;
		console.log('Distance To The Bottom:', distanceToBottom);
		console.log('handleScroll----------');

		if(isCloseToEndOfList) {
			console.log('----------------------adding a page to the bottom');
			this.setState({
				endPageIdx: this.state.endPageIdx + 1
			});
		}

		if(tooMuchOnTop) {
			console.log('----------------------removing a page from the top');
			this.setState({
				startPageIdx: this.state.startPageIdx + 1,
			});
		}
	}
	getWrapperHeight() {
		return this.$innerWrapper.current.clientHeight;
	}
	componentDidMount() {
		this.currSpacerHeight = 0;
		this.buestGuessTotalHeight();
	}
	// after things are mounted take the best guess set the height
	// so the scrollbar is atleast somewhat accurate
	buestGuessTotalHeight() {
		const numPagesShown = this.state.endPageIdx - this.state.startPageIdx;
		const currHeightOfElementsShown = this.$innerWrapper.current.clientHeight;
		const approxHeightPerPage = currHeightOfElementsShown / numPagesShown;
		// this will help us in knowing when to add and remove elements
		this.threshold = approxHeightPerPage * 2.1;
		const numTotalPages = this.props.children.length / this.state.itemsPerPage;
		const approxSizeOfWholeList = numTotalPages * approxHeightPerPage;
		this.$innerWrapper.current.parentElement.style.height = approxSizeOfWholeList + 'px';
	}
	getSnapshotBeforeUpdate(prevProps, prevState) {
		return this.$innerWrapper.current.clientHeight;
	}
	componentDidUpdate(prevProps, prevState, oldScrollerHeight) {
		console.log(oldScrollerHeight);
		console.log(this.$innerWrapper.current.clientHeight);
		const newScrollerHeight = this.$innerWrapper.current.clientHeight;
		const diff = oldScrollerHeight - newScrollerHeight;
		const shouldUpdate = diff !== 0 && this.state.startPageIdx !== prevState.startPageIdx;
		console.log(diff);
		console.log('ComponentDidUpdate-----');
		if(!shouldUpdate) {
			return;
		}

		this.currSpacerHeight += diff;
		
		this.$spacer.current.style.height = this.currSpacerHeight + 'px';
	}
	render() {
		console.log(this.currSpacerHeight);
		console.log('render---------');
		const startElemIdx = this.state.startPageIdx * this.state.itemsPerPage;
		const endElemIdx = this.state.endPageIdx * this.state.itemsPerPage;
		const visibleSubSection = this.props.children.slice(startElemIdx, endElemIdx);
		return (
			<div className="scroller" onScroll={this.handleScrollEvt}>
				<div>
					<div className="spacer" ref={this.$spacer}></div>
					<div className="inner_wrapper" ref={this.$innerWrapper}>
						{visibleSubSection}
					</div>
				</div>
			</div>
		);
	}
}


export default Scroller;
