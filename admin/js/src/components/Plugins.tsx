import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { withStyles, WithStyles, createStyles, Theme } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';

import * as API from '../api';
import { smartCompare } from './common';
import WhoAmIContext from './WhoAmIContext';

import RemoveIcon from '@material-ui/icons/RemoveCircle';

const styles = (theme: Theme) => createStyles({
	root: {
		overflow: 'auto',
	},
	alert: {
		color: theme.palette.error.dark,
	},
	head: {
		height: 40,
	},
	row: {
		height: 32,
	},
	delete: {
		padding: 2,
	},
});


interface ServersProps {
	onError: (error: unknown) => void;
}



class Plugins extends React.Component<ServersProps & WithStyles<typeof styles> & WithTranslation> {
	static contextType = WhoAmIContext;

	render() {
		const { classes, t } = this.props;
		return (
			<div className={classes.root}>

			</div>
		);
	}

}

export default withTranslation()(withStyles(styles)(Plugins));
