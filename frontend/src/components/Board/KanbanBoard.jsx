import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSocket } from '../../contexts/SocketContext';

const KanbanBoard = ({ projectId, initialBoard }) => {
  const [board, setBoard] = useState(initialBoard || { lists: [] });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const { socket, updateBoard } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('board-updated', (data) => {
        setBoard(data.boardData);
      });

      return () => {
        socket.off('board-updated');
      };
    }
  }, [socket]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'list') {
      // Reordenar listas
      const newLists = Array.from(board.lists);
      const [reorderedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, reorderedList);

      const updatedBoard = {
        ...board,
        lists: newLists.map((list, index) => ({ ...list, position: index }))
      };

      setBoard(updatedBoard);
      updateBoard(projectId, updatedBoard);
    } else {
      // Mover tarjetas
      const sourceListIndex = board.lists.findIndex(list => list._id === source.droppableId);
      const destListIndex = board.lists.findIndex(list => list._id === destination.droppableId);

      const newLists = [...board.lists];
      const sourceList = { ...newLists[sourceListIndex] };
      const destList = { ...newLists[destListIndex] };

      const sourceCards = [...sourceList.cards];
      const destCards = sourceListIndex === destListIndex ? sourceCards : [...destList.cards];

      const [movedCard] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, movedCard);

      sourceList.cards = sourceCards.map((card, index) => ({ ...card, position: index }));
      destList.cards = destCards.map((card, index) => ({ ...card, position: index }));

      newLists[sourceListIndex] = sourceList;
      if (sourceListIndex !== destListIndex) {
        newLists[destListIndex] = destList;
      }

      const updatedBoard = { ...board, lists: newLists };
      setBoard(updatedBoard);
      updateBoard(projectId, updatedBoard);
    }
  };

  const addCard = (listId) => {
    if (!newCardTitle.trim()) return;

    const newLists = board.lists.map(list => {
      if (list._id === listId) {
        const newCard = {
          _id: Date.now().toString(),
          title: newCardTitle,
          content: '',
          position: list.cards.length,
          assignedTo: [],
          labels: []
        };
        return {
          ...list,
          cards: [...list.cards, newCard]
        };
      }
      return list;
    });

    const updatedBoard = { ...board, lists: newLists };
    setBoard(updatedBoard);
    updateBoard(projectId, updatedBoard);
    
    setNewCardTitle('');
    setOpenDialog(false);
  };

  const openAddCardDialog = (list) => {
    setSelectedList(list);
    setOpenDialog(true);
  };

  return (
    <Box className="p-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" type="list" direction="horizontal">
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-4 overflow-x-auto pb-4"
            >
              {board.lists.map((list, index) => (
                <Draggable key={list._id} draggableId={list._id} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="min-w-80 max-w-80 bg-gray-100"
                    >
                      <CardContent>
                        <Box
                          {...provided.dragHandle}
                          className="flex justify-between items-center mb-3"
                        >
                          <Typography variant="h6" className="font-semibold">
                            {list.title}
                          </Typography>
                          <Chip 
                            label={list.cards.length} 
                            size="small" 
                            color="primary"
                          />
                        </Box>

                        <Droppable droppableId={list._id} type="card">
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="min-h-20 space-y-2"
                            >
                              {list.cards.map((card, cardIndex) => (
                                <Draggable
                                  key={card._id}
                                  draggableId={card._id}
                                  index={cardIndex}
                                >
                                  {(provided) => (
                                    <Card
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandle}
                                      className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    >
                                      <CardContent className="p-3">
                                        <Typography variant="body2">
                                          {card.title}
                                        </Typography>
                                        {card.labels.length > 0 && (
                                          <Box className="flex gap-1 mt-2">
                                            {card.labels.map((label, idx) => (
                                              <Chip
                                                key={idx}
                                                label={label.name}
                                                size="small"
                                                style={{ backgroundColor: label.color }}
                                              />
                                            ))}
                                          </Box>
                                        )}
                                      </CardContent>
                                    </Card>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </Box>
                          )}
                        </Droppable>

                        <Button
                          startIcon={<AddIcon />}
                          onClick={() => openAddCardDialog(list)}
                          className="w-full mt-3"
                          variant="outlined"
                          size="small"
                        >
                          Agregar tarjeta
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      {/* Dialog para agregar tarjeta */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Agregar nueva tarjeta</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Título de la tarjeta"
            fullWidth
            variant="outlined"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addCard(selectedList?._id);
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={() => addCard(selectedList?._id)} variant="contained">
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KanbanBoard;