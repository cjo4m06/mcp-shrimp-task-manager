import React from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Text,
  Badge,
  VStack,
  HStack,
  Heading,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorMode,
  useColorModeValue,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { statusColors, priorityColors, themeColors } from './colors';

/**
 * Theme Test Component
 * 
 * This component provides a visual test of the custom Chakra UI theme.
 * Use this during development to verify theme colors, components, and responsive behavior.
 * 
 * Usage:
 * import ThemeTest from '../theme/ThemeTest';
 * 
 * function App() {
 *   return (
 *     <div>
 *       <ThemeTest />
 *     </div>
 *   );
 * }
 */
const ThemeTest = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('gray.50', 'bg.canvas');
  const textColor = useColorModeValue('gray.800', 'text.default');

  return (
    <Box bg={bgColor} color={textColor} p={6} minH="100vh">
      <VStack spacing={8} align="stretch" maxW="1200px" mx="auto">
        
        {/* Header */}
        <Box>
          <Heading size="xl" mb={4}>Chakra UI Theme Test</Heading>
          <HStack>
            <Button onClick={toggleColorMode}>
              Toggle {colorMode === 'light' ? 'Dark' : 'Light'} Mode
            </Button>
            <Text>Current mode: {colorMode}</Text>
          </HStack>
        </Box>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <Heading size="lg">Color Palette</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              
              {/* Brand Colors */}
              <Box>
                <Heading size="md" mb={3}>Brand Colors</Heading>
                <HStack spacing={4} flexWrap="wrap">
                  {Object.entries(themeColors).map(([name, color]) => (
                    <VStack key={name} spacing={2}>
                      <Box
                        w="60px"
                        h="60px"
                        bg={color}
                        borderRadius="md"
                        border="1px solid"
                        borderColor="border.default"
                      />
                      <Text fontSize="sm" textAlign="center">
                        {name}<br/>
                        <Text as="span" fontSize="xs" color="text.muted">
                          {color}
                        </Text>
                      </Text>
                    </VStack>
                  ))}
                </HStack>
              </Box>

              {/* Status Colors */}
              <Box>
                <Heading size="md" mb={3}>Status Colors</Heading>
                <HStack spacing={4} flexWrap="wrap">
                  {Object.entries(statusColors).map(([status, color]) => (
                    <VStack key={status} spacing={2}>
                      <Box
                        w="60px"
                        h="60px"
                        bg={color}
                        borderRadius="md"
                        border="1px solid"
                        borderColor="border.default"
                      />
                      <Text fontSize="sm" textAlign="center">
                        {status}<br/>
                        <Text as="span" fontSize="xs" color="text.muted">
                          {color}
                        </Text>
                      </Text>
                    </VStack>
                  ))}
                </HStack>
              </Box>

              {/* Priority Colors */}
              <Box>
                <Heading size="md" mb={3}>Priority Colors</Heading>
                <HStack spacing={4} flexWrap="wrap">
                  {Object.entries(priorityColors).map(([priority, color]) => (
                    <VStack key={priority} spacing={2}>
                      <Box
                        w="60px"
                        h="60px"
                        bg={color}
                        borderRadius="md"
                        border="1px solid"
                        borderColor="border.default"
                      />
                      <Text fontSize="sm" textAlign="center">
                        {priority}<br/>
                        <Text as="span" fontSize="xs" color="text.muted">
                          {color}
                        </Text>
                      </Text>
                    </VStack>
                  ))}
                </HStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Component Tests */}
        <Card>
          <CardHeader>
            <Heading size="lg">Component Tests</Heading>
          </CardHeader>
          <CardBody>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              
              {/* Buttons */}
              <GridItem>
                <Heading size="md" mb={3}>Buttons</Heading>
                <VStack spacing={3} align="stretch">
                  <HStack spacing={3}>
                    <Button colorScheme="brand" size="sm">Small</Button>
                    <Button colorScheme="brand" size="md">Medium</Button>
                    <Button colorScheme="brand" size="lg">Large</Button>
                  </HStack>
                  <HStack spacing={3}>
                    <Button variant="solid">Solid</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                  </HStack>
                </VStack>
              </GridItem>

              {/* Badges */}
              <GridItem>
                <Heading size="md" mb={3}>Badges</Heading>
                <VStack spacing={3} align="start">
                  <HStack spacing={3}>
                    <Badge variant="solid">Solid</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="subtle">Subtle</Badge>
                  </HStack>
                  <HStack spacing={3}>
                    {Object.keys(statusColors).map(status => (
                      <Badge key={status} bg={statusColors[status]} color="white">
                        {status}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>
              </GridItem>

              {/* Form Elements */}
              <GridItem>
                <Heading size="md" mb={3}>Form Elements</Heading>
                <VStack spacing={3} align="stretch">
                  <Input placeholder="Text input" />
                  <Input placeholder="Focused input" variant="outline" />
                  <Input placeholder="Disabled input" isDisabled />
                </VStack>
              </GridItem>

              {/* Text Variants */}
              <GridItem>
                <Heading size="md" mb={3}>Text Variants</Heading>
                <VStack spacing={2} align="start">
                  <Text color="text.default">Default text</Text>
                  <Text color="text.muted">Muted text</Text>
                  <Text color="text.subtle">Subtle text</Text>
                  <Text color="text.accent">Accent text</Text>
                </VStack>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        {/* Table Test */}
        <Card>
          <CardHeader>
            <Heading size="lg">Table Component</Heading>
          </CardHeader>
          <CardBody>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Task</Th>
                  <Th>Status</Th>
                  <Th>Priority</Th>
                  <Th>Progress</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>Setup Theme</Td>
                  <Td><Badge bg={statusColors.completed} color="white">completed</Badge></Td>
                  <Td><Badge bg={priorityColors.high} color="white">high</Badge></Td>
                  <Td>100%</Td>
                </Tr>
                <Tr>
                  <Td>Test Components</Td>
                  <Td><Badge bg={statusColors.in_progress} color="white">in_progress</Badge></Td>
                  <Td><Badge bg={priorityColors.medium} color="white">medium</Badge></Td>
                  <Td>75%</Td>
                </Tr>
                <Tr>
                  <Td>Deploy</Td>
                  <Td><Badge bg={statusColors.pending} color="white">pending</Badge></Td>
                  <Td><Badge bg={priorityColors.low} color="white">low</Badge></Td>
                  <Td>0%</Td>
                </Tr>
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        {/* Background Tests */}
        <Card>
          <CardHeader>
            <Heading size="lg">Background Tests</Heading>
          </CardHeader>
          <CardBody>
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              <Box bg="bg.canvas" p={4} borderRadius="md" border="1px solid" borderColor="border.default">
                <Text>bg.canvas</Text>
              </Box>
              <Box bg="bg.surface" p={4} borderRadius="md" border="1px solid" borderColor="border.default">
                <Text>bg.surface</Text>
              </Box>
              <Box bg="bg.subtle" p={4} borderRadius="md" border="1px solid" borderColor="border.default">
                <Text>bg.subtle</Text>
              </Box>
              <Box bg="bg.muted" p={4} borderRadius="md" border="1px solid" borderColor="border.default">
                <Text>bg.muted</Text>
              </Box>
            </Grid>
          </CardBody>
        </Card>

        {/* Footer */}
        <Box textAlign="center" py={4}>
          <Text color="text.muted" fontSize="sm">
            Theme test completed. All components should render with consistent styling.
          </Text>
        </Box>

      </VStack>
    </Box>
  );
};

export default ThemeTest;